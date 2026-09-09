/**
 * 실제 지도 타일 스타일.
 *
 * Mapbox GL JS 와 같은 렌더러인 MapLibre GL 을 씁니다.
 * (Mapbox GL JS 의 오픈소스 후속 — Circle Layer / GeoJSON Source API 가 같습니다.)
 *
 * 왜 공식 mapbox://styles 를 기본값으로 안 쓰나요?
 * 공식 Mapbox 스타일은 액세스 토큰이 있어야 하고, 토큰이 없으면 미리보기가 멈춥니다.
 * OpenFreeMap Positron 은 Mapbox Light 와 같은 회색조·미니멀 벡터 지도라
 * 해안선·지형이 선명하게 남습니다.
 *
 * 공식 Mapbox Light 를 쓰려면 .env.local 에 NEXT_PUBLIC_MAPBOX_STYLE 을 넣으면 됩니다.
 * (이 경우에도 렌더러는 MapLibre 이므로 Mapbox Studio 전용 글리프는 쓰지 마세요.)
 */

export const OPENFREEMAP_POSITRON = "https://tiles.openfreemap.org/styles/positron";

/** 벡터 타일이 막힌 환경을 위한 CARTO 회색조 래스터 (역시 해안선이 분명합니다). */
export const CARTO_LIGHT_STYLE = {
  version: 8 as const,
  name: "carto-light-gray",
  sources: {
    carto: {
      type: "raster" as const,
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
      type: "raster" as const,
      source: "carto",
    },
  ],
};

export const MAP_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE || OPENFREEMAP_POSITRON;
