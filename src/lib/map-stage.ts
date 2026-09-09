import {
  DETAIL_LAYER_IDS,
  LAND_GRID_LAYER,
  PHOTO_DOTS_LAYER,
} from "@/lib/map-style";
import { mapStageFromZoom, type MapStage } from "@/lib/zoom";
import type { Map as MapboxMap } from "mapbox-gl";

function setVisible(map: MapboxMap, layerId: string, visible: boolean) {
  if (!map.getLayer(layerId)) return;
  const next = visible ? "visible" : "none";
  if (map.getLayoutProperty(layerId, "visibility") === next) return;
  map.setLayoutProperty(layerId, "visibility", next);
}

/** 조작이 끝난 뒤에만 호출. 같은 stage 면 레이어를 건드리지 않습니다. */
export function applyMapStage(map: MapboxMap, zoom: number, lastStage: MapStage | null): MapStage {
  const stage = mapStageFromZoom(zoom);
  if (stage === lastStage) return stage;

  setVisible(map, LAND_GRID_LAYER, stage === "land-dots");
  setVisible(map, PHOTO_DOTS_LAYER, stage === "photo-dots");
  const detail = stage === "detail";
  for (const layerId of DETAIL_LAYER_IDS) {
    setVisible(map, layerId, detail);
  }
  if (map.getLayer("background")) {
    map.setPaintProperty("background", "background-color", detail ? "#0b0b0b" : "#ffffff");
  }
  return stage;
}
