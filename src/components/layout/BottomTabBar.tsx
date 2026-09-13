"use client";

import { TAB_ACTIVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Crosshair, Image as ImageIcon, List, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 하단 플로팅 캡슐 탭바. 지도 · 앨범 · 기록 · 설정.
 * 활성 탭은 노란 골드, 나머지는 모노톤입니다.
 */
const TABS = [
  { href: "/", label: "지도", icon: Crosshair },
  { href: "/album", label: "앨범", icon: ImageIcon },
  { href: "/records", label: "기록", icon: List },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-auto absolute inset-x-3 bottom-3.5 z-30 sm:inset-x-4 sm:bottom-4">
      <div className="flex items-center justify-around rounded-full bg-white px-2 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 py-0.5"
            >
              <Icon
                className={cn("size-6", !active && "text-neutral-800")}
                style={active ? { color: TAB_ACTIVE } : undefined}
                strokeWidth={active ? 2.15 : 1.85}
              />
              <span
                className="text-[11px] leading-none"
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
