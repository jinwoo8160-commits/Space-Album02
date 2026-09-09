import type { StyleSpecification } from "maplibre-gl";

/**
 * 실제 지도 타일 스타일.
 *
 * Mapbox GL JS 와 같은 렌더러인 MapLibre GL 을 씁니다.
 * (Mapbox GL JS 의 오픈소스 후속 — Circle Layer / GeoJSON Source API 가 같습니다.)
 *
 * OpenFreeMap Positron 은 Mapbox Light 계열의 회색조 벡터 지도입니다.
 * 주거지역 fill 이 큰 회색 얼룩처럼 보여 도트와 헷갈릴 수 있어,
 * 해안선(water) · 경계 · 라벨 · 도로만 남기고 면 채우기는 걷어냅니다.
 */
export const OPENFREEMAP_POSITRON = "https://tiles.openfreemap.org/styles/positron";

/** 지형 윤곽을 가리는 면(fill) 레이어. 해안선(water)은 빼지 않습니다. */
const MUSHY_FILL_LAYER_IDS = new Set([
  "park",
  "landcover_ice_shelf",
  "landcover_glacier",
  "landuse_residential",
  "landcover_wood",
  "aeroway-area",
  "ne2_shaded",
]);

export const CARTO_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  name: "carto-light-gray",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [
    {
      id: "carto-light",
      type: "raster",
      source: "carto",
    },
  ],
};

export async function loadMinimalGrayStyle(): Promise<StyleSpecification> {
  try {
    const response = await fetch(OPENFREEMAP_POSITRON);
    if (!response.ok) throw new Error("style fetch failed");
    const style = (await response.json()) as StyleSpecification;
    style.layers = (style.layers ?? []).filter((layer) => !MUSHY_FILL_LAYER_IDS.has(layer.id));

    const background = style.layers.find((layer) => layer.id === "background");
    if (background?.type === "background") {
      background.paint = { ...(background.paint ?? {}), "background-color": "#f3f3f1" };
    }
    const water = style.layers.find((layer) => layer.id === "water");
    if (water?.type === "fill") {
      water.paint = { ...(water.paint ?? {}), "fill-color": "#d5dee6" };
    }
    return style;
  } catch {
    return CARTO_LIGHT_STYLE;
  }
}
