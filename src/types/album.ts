/**
 * 시공간 앨범에서 쓰는 핵심 타입 모음.
 *
 * 왜 한 파일에 모아 두나요?
 * - 지도 / 필터 / 타임피커가 같은 데이터 모양을 공유해야 합니다.
 * - 타입이 흩어지면 "사진은 어디에 category가 있지?"를 매번 찾게 됩니다.
 */

/** 사용자가 지정할 수 있는 카테고리 색. null 은 "아직 분류하지 않음". */
export type CategoryColor = "pink" | "green" | "cyan" | "red" | null;

/**
 * 필터 UI 에서는 null 을 그대로 Set 에 넣기 어렵습니다.
 * (Set 은 값이지만, "미분류 핀"을 토글하는 키로는 문자열이 더 안전합니다.)
 * 그래서 필터 전용 키를 따로 둡니다.
 */
export type CategoryFilterKey = "pink" | "green" | "cyan" | "red" | "unclassified";

/**
 * 줌 단계를 숫자(0~3)가 아니라 이름로 둔 이유:
 * if (zoom === 2) 는 "2가 구/시인지" 매번 기억해야 하지만,
 * if (zoomLevel === "city") 는 조건문 자체가 설명이 됩니다.
 */
export type ZoomLevel = "country" | "province" | "city" | "neighborhood";

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
