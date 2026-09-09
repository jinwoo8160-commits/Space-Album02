/**
 * Mapbox GL JS 초기화에 쓰는 값.
 *
 * 토큰은 코드에 하드코딩하지 않습니다.
 * Next.js 는 NEXT_PUBLIC_ 변수를 번들에 넣으므로 .env.local 에만 둡니다.
 * (저장소에는 .env.example 만 커밋)
 */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/**
 * Dark/Monochrome — 해안선·행정 경계가 또렷한 공식 미니멀 스타일.
 * TODO: [디자인] 첨부 이미지 스타일 반영 위치 — Studio 커스텀 스타일로 바꿀 때 여기만 교체
 */
export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";
