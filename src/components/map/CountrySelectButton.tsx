"use client";

import { Button } from "@/components/ui/button";
import { useMap } from "@/context/map-context";
import { ChevronDown, Globe } from "lucide-react";

/** TODO: [디자인] 첨부 이미지 스타일 반영 위치 — 상단 왼쪽 알약 버튼 (지구본 + 국가 선택 + 셰브론) */
export function CountrySelectButton() {
  const { setCountryModalOpen } = useMap();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setCountryModalOpen(true)}
      className="h-10 rounded-full border-neutral-200 bg-white px-3.5 text-[13px] font-medium text-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-white"
    >
      <Globe className="size-4 text-neutral-700" />
      국가 선택
      <ChevronDown className="size-3.5 text-neutral-500" />
    </Button>
  );
}
