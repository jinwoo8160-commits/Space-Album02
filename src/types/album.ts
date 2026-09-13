/**
 * 시공간 앨범에서 쓰는 핵심 타입 모음.
 *
 * 왜 한 파일에 모아 두나요?
 * - 지도 / 필터 / 타임피커가 같은 데이터 모양을 공유해야 합니다.
 * - 타입이 흩어지면 "사진은 어디에 category가 있지?"를 매번 찾게 됩니다.
 */

/** 사용자가 지정할 수 있는 카테고리. null 은 "아직 분류하지 않음". 커스텀 id 도 허용합니다. */
export type CategoryColor = string | null;

export type KeyCategory = {
  id: string;
  name: string;
  hex: string;
};

/**
 * 필터 UI 에서는 null 을 그대로 Set 에 넣기 어렵습니다.
 * (Set 은 값이지만, "미분류 핀"을 토글하는 키로는 문자열이 더 안전합니다.)
 */
export type CategoryFilterKey = string;

/**
 * 줌에 따라 올라가는 레이어 종류.
 * 숫자는 지도 엔진 줌이고, 이 이름은 "지금 무엇을 그릴지"입니다.
 *
 * 0~9.5   dots      배경 도트 격자
 * 9.5~12  clusters  흰 모노톤 지도 + 묶음 핀
 * 12+     pins      흰 모노톤 지도 + 개별 핀
 */
export type OverlayMode = "dots" | "clusters" | "pins";

/** @deprecated OverlayMode 를 쓰세요. 예전 4단계 이름과의 호환용 별칭 */
export type ZoomLevel = OverlayMode;

export type CountryId = "kr" | "jp" | "cn" | "us";

export type ProvinceId =
  | "seoul-gyeonggi"
  | "gangwon"
  | "chungcheong"
  | "jeolla"
  | "gyeongsang"
  | "jeju"
  | "other";

/** 사진 한 장의 원본 데이터. 실제 앱이라면 서버/EXIF 에서 옵니다. */
export type Photo = {
  id: string;
  title: string;
  /** ISO 날짜 문자열. Date 객체를 바로 넣지 않는 이유: JSON mock 과 직렬화가 쉽습니다. */
  takenAt: string;
  lat: number;
  lng: number;
  countryId: CountryId;
  provinceId: ProvinceId;
  /** 지도 핀 아래 / 상세 팝업에 보여줄 주소 느낌의 라벨 */
  locationLabel: string;
  districtLabel: string;
  category: CategoryColor;
  /** ScenicPhoto 가 어떤 그림을 그릴지 결정하는 키 (외부 이미지 없이 동작) */
  scene: PhotoScene;
  /** false 면 EXIF 위치가 없어 지도에는 올리지 않습니다. */
  hasGps?: boolean;
};

export type PhotoScene =
  | "fire"
  | "city-night"
  | "river"
  | "food"
  | "blossom"
  | "mountain"
  | "beach"
  | "temple"
  | "snow"
  | "sunset"
  | "cafe"
  | "street"
  | "harbor"
  | "park"
  | "skyline";

export type GeoBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

/** 도시/동 수준에서 "지금 화면이 어디를 보고 있는가" */
export type MapFocus = {
  lat: number;
  lng: number;
  /** 화면 세로가 몇 도(latitude)를 담는지. 작을수록 더 확대. */
  span: number;
};

export type TimeFilter = {
  /** 연도는 필수. 사진이 없는 연도를 고르면 빈 상태가 됩니다. */
  year: number;
  /** null 이면 해당 연도의 모든 월 (UI 의 ALL / -) */
  month: number | null;
  /** null 이면 해당 월의 모든 일 */
  day: number | null;
};

export type DotCell = {
  row: number;
  col: number;
  lat: number;
  lng: number;
  provinceId: ProvinceId;
  countryId: CountryId;
};

export type PhotoCluster = {
  id: string;
  lat: number;
  lng: number;
  photos: Photo[];
};
