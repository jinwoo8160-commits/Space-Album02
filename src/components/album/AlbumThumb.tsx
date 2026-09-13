"use client";

import type { PhotoScene } from "@/types/album";
import type { ReactNode } from "react";

/**
 * 앨범 그리드용 납작한 일러스트. 레퍼런스의 다섯 열 썸네일 감성을 맞춥니다.
 */
export function AlbumThumb({ scene, className }: { scene: PhotoScene; className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {SCENE[scene]}
      </svg>
    </div>
  );
}

const SCENE: Record<PhotoScene, ReactNode> = {
  park: (
    <>
      <rect width="100" height="100" fill="#d8ecfa" />
      <rect y="72" width="100" height="28" fill="#8fd18a" />
      <rect x="22" y="48" width="6" height="28" rx="2" fill="#c48a4a" />
      <rect x="62" y="52" width="6" height="24" rx="2" fill="#c48a4a" />
      <circle cx="25" cy="42" r="16" fill="#3cae4a" />
      <circle cx="65" cy="44" r="18" fill="#f0c84a" />
    </>
  ),
  mountain: (
    <>
      <rect width="100" height="100" fill="#d9eefb" />
      <circle cx="78" cy="22" r="10" fill="#ffe14a" />
      <path d="M6 86 L38 28 L70 86 Z" fill="#c9b4e8" />
      <path d="M40 86 L72 22 L98 86 Z" fill="#8b6bb8" />
      <rect y="84" width="100" height="16" fill="#b7e38a" />
    </>
  ),
  cafe: (
    <>
      <rect width="100" height="100" fill="#d8edfb" />
      <rect y="78" width="100" height="22" fill="#7ecf74" />
      <rect x="28" y="42" width="44" height="36" rx="4" fill="#fff7ef" />
      <path d="M22 46 L50 24 L78 46 Z" fill="#f08a4a" />
      <rect x="46" y="56" width="10" height="22" fill="#d98a4a" />
      <circle cx="38" cy="54" r="4" fill="#7ec8e8" />
    </>
  ),
  "city-night": (
    <>
      <rect width="100" height="100" fill="#1c2748" />
      <circle cx="78" cy="18" r="8" fill="#f4f1c8" />
      <rect x="10" y="48" width="18" height="52" fill="#3a4a78" />
      <rect x="34" y="28" width="16" height="72" fill="#2c3a66" />
      <rect x="56" y="40" width="22" height="60" fill="#44558a" />
      <rect x="82" y="34" width="12" height="66" fill="#2a365e" />
      {[16, 22, 38, 44, 62, 70, 86].map((x) => (
        <rect key={x} x={x} y={x % 20 === 6 ? 56 : 64} width="4" height="5" rx="1" fill="#ffe58a" />
      ))}
    </>
  ),
  harbor: (
    <>
      <rect width="100" height="100" fill="#14345c" />
      <circle cx="72" cy="24" r="14" fill="#f6e27a" />
      <rect y="58" width="100" height="42" fill="#2f6fbf" />
      <path d="M0 58 Q 50 70 100 58" fill="#3f86d4" />
    </>
  ),
  blossom: (
    <>
      <rect width="100" height="100" fill="#d9eef8" />
      <rect y="78" width="100" height="22" fill="#9ad48a" />
      <rect x="46" y="40" width="8" height="42" rx="2" fill="#c48a4a" />
      <circle cx="36" cy="36" r="14" fill="#ff7ab0" />
      <circle cx="58" cy="28" r="16" fill="#ff8fbf" />
      <circle cx="70" cy="44" r="12" fill="#ff6aa3" />
    </>
  ),
  street: (
    <>
      <rect width="100" height="100" fill="#14261c" />
      <circle cx="78" cy="18" r="7" fill="#f3e6a0" />
      <rect y="78" width="100" height="22" fill="#1d3a28" />
      <circle cx="28" cy="52" r="20" fill="#1f6b3a" />
      <circle cx="58" cy="44" r="24" fill="#185c32" />
      <circle cx="80" cy="58" r="16" fill="#247a42" />
    </>
  ),
  river: (
    <>
      <rect width="100" height="100" fill="#d7eefc" />
      <ellipse cx="72" cy="22" rx="16" ry="10" fill="#ffffff" />
      <rect y="52" width="100" height="48" fill="#6ec6e8" />
      <ellipse cx="50" cy="62" rx="22" ry="10" fill="#5aae5a" />
      <rect x="46" y="48" width="8" height="16" fill="#3d8c3d" />
    </>
  ),
  fire: (
    <>
      <rect width="100" height="100" fill="#9ad7a0" />
      <rect y="70" width="100" height="30" fill="#6cbe72" />
      <rect x="44" y="38" width="12" height="34" fill="#f2f4f0" />
      <circle cx="50" cy="32" r="14" fill="#f2f4f0" />
      <path d="M50 38 L96 50 L50 46 Z" fill="#fff4b0" opacity="0.9" />
    </>
  ),
  food: (
    <>
      <rect width="100" height="100" fill="#d8f0c8" />
      <path d="M0 70 Q 30 40 60 70 T 100 64 L100 100 L0 100 Z" fill="#7ecf6c" />
      <path d="M0 82 Q 40 60 80 84 T 100 80 L100 100 L0 100 Z" fill="#5bb85a" />
    </>
  ),
  sunset: (
    <>
      <rect width="100" height="70" fill="#f08a4a" />
      <rect y="70" width="100" height="30" fill="#1b2a44" />
      <circle cx="22" cy="22" r="10" fill="#ffe14a" />
      <rect x="8" y="48" width="14" height="22" fill="#2c3a5c" />
      <rect x="28" y="36" width="12" height="34" fill="#243250" />
      <rect x="48" y="42" width="18" height="28" fill="#31405c" />
      <rect x="74" y="30" width="14" height="40" fill="#1f2c48" />
    </>
  ),
  skyline: (
    <>
      <rect width="100" height="100" fill="#7ec8f0" />
      <ellipse cx="50" cy="48" rx="28" ry="16" fill="#ffffff" />
      <ellipse cx="38" cy="52" rx="16" ry="12" fill="#f2f8ff" />
    </>
  ),
  snow: (
    <>
      <rect width="100" height="100" fill="#d8eefc" />
      <path d="M10 86 L50 18 L90 86 Z" fill="#e8f4ff" />
      <path d="M36 40 L50 18 L64 40 Z" fill="#ffffff" />
      <rect y="84" width="100" height="16" fill="#cfe6fb" />
    </>
  ),
  temple: (
    <>
      <rect width="100" height="100" fill="#d9eef8" />
      <rect y="78" width="100" height="22" fill="#8fd18a" />
      <path d="M30 78 L38 28 L46 78 Z" fill="#ff5b8a" />
      <path d="M54 78 L62 22 L70 78 Z" fill="#ff7aa3" />
      <rect x="36" y="70" width="4" height="10" fill="#3cae4a" />
      <rect x="60" y="68" width="4" height="12" fill="#3cae4a" />
    </>
  ),
  beach: (
    <>
      <rect width="100" height="58" fill="#7fd0ea" />
      <rect y="58" width="100" height="42" fill="#f3d39a" />
      <circle cx="78" cy="18" r="10" fill="#ffe14a" />
      <rect x="22" y="40" width="6" height="28" fill="#7a4a22" />
      <path d="M8 44 Q 25 8 42 44 Z" fill="#3cae4a" />
    </>
  ),
};
