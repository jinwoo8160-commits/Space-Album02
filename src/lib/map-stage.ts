import {
  DETAIL_LAYER_IDS,
  LAND_GRID_LAYER,
} from "@/lib/map-style";
import { mapStageFromZoom, type MapStage } from "@/lib/zoom";
import type { Map as MapboxMap } from "mapbox-gl";

function setVisible(map: MapboxMap, layerId: string, visible: boolean) {
  if (!map.getLayer(layerId)) return;
  const next = visible ? "visible" : "none";
  if (map.getLayoutProperty(layerId, "visibility") === next) return;
  map.setLayoutProperty(layerId, "visibility", next);
}

/** zoomend 이후에만 호출. 9.5를 넘을 때만 visibility 를 1회 바꿉니다. */
export function applyMapStage(map: MapboxMap, zoom: number, lastStage: MapStage | null): MapStage {
  const stage = mapStageFromZoom(zoom);
  if (stage === lastStage) return stage;

  setVisible(map, LAND_GRID_LAYER, stage === "dots");
  const detail = stage === "detail";
  for (const layerId of DETAIL_LAYER_IDS) {
    setVisible(map, layerId, detail);
  }
  return stage;
}
