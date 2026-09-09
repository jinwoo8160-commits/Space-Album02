"use client";

import { BottomTabBar } from "@/components/layout/BottomTabBar";
import type { ReactNode } from "react";

/**
 * 데스크톱에서는 스케치와 같은 390px 폰 프레임,
 * 실제 모바일에서는 화면을 가득 채웁니다.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-200 p-0 sm:p-6">
      <div
        id="phone-frame"
        className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-white sm:h-[min(844px,100dvh)] sm:rounded-[36px] sm:border sm:border-neutral-200 sm:shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <BottomTabBar />
      </div>
    </div>
  );
}
