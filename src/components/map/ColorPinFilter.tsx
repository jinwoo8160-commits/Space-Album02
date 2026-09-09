"use client";

import { CATEGORY_HEX, CATEGORY_LABEL, UNCLASSIFIED_HEX } from "@/lib/constants";
import { useMap } from "@/context/map-context";
import type { CategoryFilterKey } from "@/types/album";
import { Plus } from "lucide-react";

const FILTER_ORDER: CategoryFilterKey[] = ["pink", "green", "cyan", "red", "unclassified"];

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 상단 오른쪽 세로 원형 핀 (분홍/초록/시안/빨강 + 검정 플러스)
 *
 * 다중 선택 토글:
 * selectedCategories 는 Set 이라 같은 핀을 다시 누르면 빠집니다.
 * 빈 Set = "필터 없음" = 전체 표시. (요구사항 B-2)
 */
export function ColorPinFilter() {
  const { selectedCategories, toggleCategory } = useMap();

  return (
    <div className="flex flex-col items-center gap-3">
      {FILTER_ORDER.map((key) => {
        const active = selectedCategories.has(key);
        const isUnclassified = key === "unclassified";
        const bg = isUnclassified ? UNCLASSIFIED_HEX : CATEGORY_HEX[key];

        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            aria-label={`${CATEGORY_LABEL[key]} 필터`}
            onClick={() => toggleCategory(key)}
            className="relative size-9 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition-transform"
            style={{
              backgroundColor: bg,
              transform: active ? "scale(1.08)" : "scale(1)",
              boxShadow: active ? `0 0 0 3px white, 0 0 0 5px ${bg}` : undefined,
            }}
          >
            {isUnclassified ? <Plus className="mx-auto size-4 text-white" strokeWidth={3} /> : null}
          </button>
        );
      })}
    </div>
  );
}
