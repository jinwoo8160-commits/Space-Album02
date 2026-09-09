"use client";

import { CATEGORY_HEX, hexForCategory } from "@/lib/constants";
import type { CategoryColor, PhotoScene } from "@/types/album";

/**
 * 외부 이미지 URL 없이 사진처럼 보이는 장면 썸네일.
 * mock 사진마다 scene 키가 달라서 클러스터 스택이 서로 다른 그림으로 쌓입니다.
 *
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치
 * 실제 갤러리 이미지로 바꿀 때는 이 컴포넌트만 <img src={photo.url} /> 로 교체하면 됩니다.
 */
export function ScenicPhoto({
  scene,
  className,
}: {
  scene: PhotoScene;
  className?: string;
}) {
  const palette = SCENE_PALETTE[scene];

  return (
    <div className={className} style={{ background: palette.bg }} aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <rect width="100" height="100" fill={palette.bg} />
        {scene === "fire" && <FireScene />}
        {scene === "city-night" && <CityScene />}
        {scene === "river" && <RiverScene />}
        {scene === "food" && <FoodScene />}
        {scene === "blossom" && <BlossomScene />}
        {scene === "mountain" && <MountainScene />}
        {scene === "beach" && <BeachScene />}
        {scene === "temple" && <TempleScene />}
        {scene === "snow" && <SnowScene />}
        {scene === "sunset" && <SunsetScene />}
        {scene === "cafe" && <CafeScene />}
        {scene === "street" && <StreetScene />}
        {scene === "harbor" && <HarborScene />}
        {scene === "park" && <ParkScene />}
        {scene === "skyline" && <SkylineScene />}
      </svg>
    </div>
  );
}

const SCENE_PALETTE: Record<PhotoScene, { bg: string }> = {
  fire: { bg: "#1a0c08" },
  "city-night": { bg: "#0b1020" },
  river: { bg: "#7ec8e3" },
  food: { bg: "#f3d5b5" },
  blossom: { bg: "#f8dce8" },
  mountain: { bg: "#f2c38d" },
  beach: { bg: "#87d6ea" },
  temple: { bg: "#ead7b4" },
  snow: { bg: "#d9e4f0" },
  sunset: { bg: "#f4a261" },
  cafe: { bg: "#cbb79a" },
  street: { bg: "#2b2b2b" },
  harbor: { bg: "#12355b" },
  park: { bg: "#8fbf73" },
  skyline: { bg: "#1c1c28" },
};

function FireScene() {
  return (
    <>
      <rect y="62" width="100" height="38" fill="#140904" />
      <ellipse cx="50" cy="78" rx="22" ry="8" fill="#3a1d0a" />
      <path d="M38 78 L42 52 L50 68 L58 46 L62 78 Z" fill="#ff6b1a" />
      <path d="M44 78 L50 40 L56 78 Z" fill="#ffd166" />
      <circle cx="28" cy="22" r="8" fill="#f4d35e" opacity="0.35" />
    </>
  );
}

function CityScene() {
  return (
    <>
      <rect y="40" width="18" height="60" fill="#1e2a4a" x="8" />
      <rect y="28" width="16" height="72" fill="#162038" x="30" />
      <rect y="48" width="22" height="52" fill="#243056" x="50" />
      <rect y="22" width="14" height="78" fill="#101828" x="78" />
      {[12, 18, 24, 36, 42, 56, 62, 70, 82, 88].map((x) => (
        <rect key={x} x={x} y={x % 20 === 0 ? 50 : 60} width="3" height="4" fill="#ffe08a" />
      ))}
    </>
  );
}

function RiverScene() {
  return (
    <>
      <rect y="55" width="100" height="45" fill="#4aa3c7" />
      <path d="M0 55 Q 40 40 100 58 L100 55 Z" fill="#6fbf7a" />
      <ellipse cx="70" cy="20" rx="12" ry="12" fill="#fff4c2" />
    </>
  );
}

function FoodScene() {
  return (
    <>
      <ellipse cx="50" cy="62" rx="32" ry="10" fill="#e9c8a0" />
      <circle cx="50" cy="48" r="22" fill="#d9480f" />
      <circle cx="42" cy="44" r="5" fill="#fff3bf" />
      <circle cx="58" cy="50" r="4" fill="#2f9e44" />
    </>
  );
}

function BlossomScene() {
  return (
    <>
      <rect x="46" y="40" width="6" height="50" fill="#6b4226" />
      {[
        [30, 36],
        [50, 22],
        [68, 34],
        [40, 28],
        [60, 26],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10" fill="#ff8fab" />
      ))}
    </>
  );
}

function MountainScene() {
  return (
    <>
      <rect y="70" width="100" height="30" fill="#f4a261" />
      <path d="M0 70 L35 28 L55 70 Z" fill="#e76f51" />
      <path d="M40 70 L70 18 L100 70 Z" fill="#c44536" />
      <circle cx="78" cy="22" r="8" fill="#ffe066" />
    </>
  );
}

function BeachScene() {
  return (
    <>
      <rect y="58" width="100" height="42" fill="#f2d2a9" />
      <rect y="48" width="100" height="16" fill="#3dbce3" />
      <circle cx="22" cy="22" r="10" fill="#ffe66d" />
    </>
  );
}

function TempleScene() {
  return (
    <>
      <rect x="30" y="48" width="40" height="32" fill="#9c2a2a" />
      <path d="M22 48 L50 22 L78 48 Z" fill="#c1121f" />
      <rect x="46" y="58" width="8" height="22" fill="#6b2d2d" />
    </>
  );
}

function SnowScene() {
  return (
    <>
      <rect y="60" width="100" height="40" fill="#f8fafc" />
      <rect x="20" y="38" width="18" height="30" fill="#64748b" />
      <rect x="50" y="28" width="22" height="40" fill="#475569" />
      <circle cx="18" cy="18" r="2" fill="white" />
      <circle cx="40" cy="12" r="2" fill="white" />
      <circle cx="70" cy="20" r="2" fill="white" />
      <circle cx="88" cy="14" r="2" fill="white" />
    </>
  );
}

function SunsetScene() {
  return (
    <>
      <rect y="62" width="100" height="38" fill="#2a6f97" />
      <circle cx="50" cy="42" r="16" fill="#e63946" />
      <rect y="62" width="100" height="6" fill="#f4a261" opacity="0.5" />
    </>
  );
}

function CafeScene() {
  return (
    <>
      <rect x="18" y="30" width="64" height="50" fill="#8b5e34" />
      <rect x="28" y="40" width="18" height="18" fill="#ffe8d6" />
      <rect x="54" y="40" width="18" height="18" fill="#ffe8d6" />
      <rect x="44" y="58" width="12" height="22" fill="#5c4033" />
    </>
  );
}

function StreetScene() {
  return (
    <>
      <rect y="70" width="100" height="30" fill="#3f3f46" />
      <rect x="10" y="20" width="24" height="50" fill="#52525b" />
      <rect x="42" y="8" width="20" height="62" fill="#27272a" />
      <rect x="70" y="28" width="22" height="42" fill="#3f3f46" />
      <rect x="0" y="78" width="100" height="4" fill="#facc15" opacity="0.7" />
    </>
  );
}

function HarborScene() {
  return (
    <>
      <rect y="58" width="100" height="42" fill="#1d4e89" />
      <path d="M10 58 L40 58 L28 30 Z" fill="#e9ecef" />
      <rect x="60" y="44" width="28" height="16" fill="#adb5bd" />
    </>
  );
}

function ParkScene() {
  return (
    <>
      <rect y="70" width="100" height="30" fill="#74c69d" />
      <circle cx="30" cy="48" r="18" fill="#2d6a4f" />
      <circle cx="70" cy="42" r="22" fill="#40916c" />
      <rect x="28" y="48" width="4" height="28" fill="#6b4226" />
      <rect x="68" y="42" width="4" height="34" fill="#6b4226" />
    </>
  );
}

function SkylineScene() {
  return (
    <>
      <rect x="8" y="36" width="14" height="64" fill="#4c4c6d" />
      <rect x="28" y="18" width="12" height="82" fill="#22223b" />
      <rect x="46" y="28" width="18" height="72" fill="#4a4e69" />
      <rect x="70" y="10" width="16" height="90" fill="#1b1b2f" />
      <circle cx="80" cy="18" r="6" fill={CATEGORY_HEX.pink} />
    </>
  );
}

export function categoryBorderColor(category: CategoryColor, hexById: Record<string, string> = CATEGORY_HEX): string {
  return hexForCategory(category, hexById);
}
