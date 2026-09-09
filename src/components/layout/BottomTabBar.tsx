"use client";

import { TAB_ACTIVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Crosshair, List, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 하단 플로팅 알약 탭바. 활성 탭은 스케치처럼 노란 골드.
 *
 * 왜 Next.js Link 인가?
 * 기록/설정은 "빈 페이지"가 맞으므로, 상태만 바꾸는 탭보다
 * 실제 라우트가 있어야 초보자가 URL 과 화면의 관계를 볼 수 있습니다.
 */
const TABS = [
  { href: "/", label: "지도", icon: Crosshair },
  { href: "/records", label: "기록", icon: List },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-auto absolute inset-x-4 bottom-4 z-30">
      <div className="flex items-end justify-around rounded-[28px] bg-white px-2 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-w-[72px] flex-col items-center gap-0.5"
            >
              <Icon
                className={cn("size-6", !active && "text-neutral-800")}
                style={active ? { color: TAB_ACTIVE } : undefined}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[11px]",
                  tab.label === "기록" && "font-[family-name:var(--font-hand)] text-[13px]",
                )}
                style={{ color: active ? TAB_ACTIVE : "#171717" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
