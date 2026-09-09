"use client";

import { PhotoClusterMarker } from "@/components/map/PhotoClusterMarker";
import { PhotoPin } from "@/components/map/PhotoPin";
import { useMap } from "@/context/map-context";
import { clusterPhotos } from "@/lib/clustering";
import { boundsFromFocus, projectToView } from "@/lib/geo";
import type { PhotoCluster } from "@/types/album";
import { useMemo } from "react";

/**
 * 구/시 · 동 수준의 미니멀 스트리트 맵.
 *
 * 왜 실제 타일(카카오/구글)을 안 쓰나요?
 * API 키 없이도 스케치 3~4의 "밝은 도로 + 한글 지명 + 폴라로이드 묶음"을
 * 재현하는 게 1차 목표입니다. 나중에 Mapbox 로 바꿀 때는
 * projectToView 결과(left/top %) 만 마커 좌표로 넘기면 됩니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 도로 굵기, 지명 폰트, 배경색
 */
export function StreetMap() {
  const { filteredPhotos, zoomLevel, focus, jumpToNeighborhood, openPhoto } = useMap();

  const viewport = focus ?? { lat: 37.55, lng: 127.0, span: 0.22 };
  const bounds = boundsFromFocus(viewport.lat, viewport.lng, viewport.span);
  const clusters = useMemo(
    () => clusterPhotos(filteredPhotos, zoomLevel),
    [filteredPhotos, zoomLevel],
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f3f3f1]">
      <StreetGrid />
      <DistrictLabels zoomLevel={zoomLevel} />

      {clusters.map((cluster) => {
        const point = projectToView(cluster.lat, cluster.lng, bounds, 100, 100);
        if (point.x < -8 || point.x > 108 || point.y < -8 || point.y > 108) return null;

        const style = {
          left: `${point.x}%`,
          top: `${point.y}%`,
        } as const;

        if (zoomLevel === "neighborhood" && cluster.photos.length === 1) {
          return (
            <div key={cluster.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
              <PhotoPin photo={cluster.photos[0]!} onClick={() => openPhoto(cluster.photos[0]!.id)} />
            </div>
          );
        }

        return (
          <div key={cluster.id} className="absolute -translate-x-1/2 -translate-y-[70%]" style={style}>
            <PhotoClusterMarker
              cluster={cluster}
              onClick={() => handleClusterClick(cluster, zoomLevel, jumpToNeighborhood, openPhoto)}
            />
          </div>
        );
      })}
    </div>
  );
}

function handleClusterClick(
  cluster: PhotoCluster,
  zoomLevel: string,
  jumpToNeighborhood: (lat: number, lng: number) => void,
  openPhoto: (id: string) => void,
) {
  if (zoomLevel === "city") {
    jumpToNeighborhood(cluster.lat, cluster.lng);
    return;
  }
  openPhoto(cluster.photos[0]!.id);
}

function StreetGrid() {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          x2="100%"
          y1={`${(i + 1) * 7}%`}
          y2={`${(i + 1) * 7}%`}
          stroke={i % 4 === 0 ? "#d8d8d4" : "#e7e7e3"}
          strokeWidth={i % 4 === 0 ? 3 : 1}
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`v-${i}`}
          y1="0"
          y2="100%"
          x1={`${(i + 1) * 9.5}%`}
          x2={`${(i + 1) * 9.5}%`}
          stroke={i % 3 === 0 ? "#d8d8d4" : "#e7e7e3"}
          strokeWidth={i % 3 === 0 ? 3 : 1}
        />
      ))}
      <line x1="8%" y1="20%" x2="92%" y2="78%" stroke="#dadad6" strokeWidth="5" />
      <line x1="18%" y1="90%" x2="70%" y2="12%" stroke="#e1e1dc" strokeWidth="4" />
    </svg>
  );
}

function DistrictLabels({ zoomLevel }: { zoomLevel: string }) {
  const labels =
    zoomLevel === "neighborhood"
      ? [
          { name: "무학로", x: "22%", y: "28%" },
          { name: "왕십리로", x: "58%", y: "46%" },
          { name: "금호로", x: "70%", y: "68%" },
        ]
      : [
          { name: "강북구", x: "38%", y: "18%" },
          { name: "동대문구", x: "62%", y: "32%" },
          { name: "성동구", x: "58%", y: "52%" },
          { name: "중구", x: "36%", y: "48%" },
        ];

  return (
    <>
      {labels.map((label) => (
        <span
          key={label.name}
          className="pointer-events-none absolute text-[11px] text-neutral-400"
          style={{ left: label.x, top: label.y }}
        >
          {label.name}
        </span>
      ))}
    </>
  );
}
