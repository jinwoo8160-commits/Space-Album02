import type { Photo } from "@/types/album";

/**
 * 1차 구현용 mock 사진 16장.
 *
 * 실제 앱에서는 갤러리/서버에서 오지만, UI·필터·줌 로직을 먼저 검증하려면
 * "날짜 / 좌표 / 색이 골고루 다른" 고정 데이터가 필요합니다.
 *
 * 배치 의도:
 * - 서울·경기를 많이 넣어 국가 도트맵에서 북서가 진하게 보이게
 * - 부산을 넣어 남동이 두 번째로 진하게 보이게 (스케치 1~2와 동일)
 * - 같은 좌표 2장 → 동 수준에서만 묶이는 케이스
 * - 미분류(null) 2장 → 컬러핀 빈 선택 / 미분류 핀 동작 확인
 */

export const MOCK_PHOTOS: Photo[] = [
  {
    id: "p01",
    title: "성수동 캠프파이어",
    takenAt: "2025-09-04T21:10:00",
    lat: 37.5447,
    lng: 127.0559,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 성동구 왕십리로 83",
    districtLabel: "성동구",
    category: "pink",
    scene: "fire",
  },
  {
    id: "p02",
    title: "성수동 골목 야경",
    takenAt: "2025-09-04T22:40:00",
    // 동일 좌표: 동 수준에서만 한 묶음이 됩니다.
    lat: 37.5447,
    lng: 127.0559,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 성동구 왕십리로 83",
    districtLabel: "성동구",
    category: "pink",
    scene: "street",
  },
  {
    id: "p03",
    title: "무학로 퇴근길",
    takenAt: "2025-08-18T19:05:00",
    lat: 37.5631,
    lng: 127.0368,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 중구 무학로 15",
    districtLabel: "중구",
    category: "cyan",
    scene: "city-night",
  },
  {
    id: "p04",
    title: "한강 노을",
    takenAt: "2025-07-21T18:50:00",
    lat: 37.5285,
    lng: 126.934,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 마포구 한강나루로",
    districtLabel: "마포구",
    category: "green",
    scene: "sunset",
  },
  {
    id: "p05",
    title: "강북구 카페",
    takenAt: "2025-03-02T14:20:00",
    lat: 37.6396,
    lng: 127.0257,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 강북구 도봉로 89",
    districtLabel: "강북구",
    category: null,
    scene: "cafe",
  },
  {
    id: "p06",
    title: "동대문 새벽",
    takenAt: "2024-12-24T23:55:00",
    lat: 37.5714,
    lng: 127.0096,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 동대문구 왕산로",
    districtLabel: "동대문구",
    category: "red",
    scene: "city-night",
  },
  {
    id: "p07",
    title: "남산 봄꽃",
    takenAt: "2025-04-12T11:10:00",
    lat: 37.5512,
    lng: 126.9882,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 용산구 남산공원길",
    districtLabel: "용산구",
    category: "green",
    scene: "blossom",
  },
  {
    id: "p08",
    title: "성동구 공원",
    takenAt: "2025-06-08T16:00:00",
    lat: 37.5502,
    lng: 127.0401,
    countryId: "kr",
    provinceId: "seoul-gyeonggi",
    locationLabel: "서울특별시 성동구 금호로",
    districtLabel: "성동구",
    category: "cyan",
    scene: "park",
  },
  {
    id: "p09",
    title: "해운대 아침",
    takenAt: "2025-06-15T07:30:00",
    lat: 35.1586,
    lng: 129.1604,
    countryId: "kr",
    provinceId: "gyeongsang",
    locationLabel: "부산광역시 해운대구 해운대해변로",
    districtLabel: "해운대구",
    category: "pink",
    scene: "beach",
  },
  {
    id: "p10",
    title: "광안대교",
    takenAt: "2024-08-02T20:15:00",
    lat: 35.1532,
    lng: 129.1185,
    countryId: "kr",
    provinceId: "gyeongsang",
    locationLabel: "부산광역시 수영구 광안해변로",
    districtLabel: "수영구",
    category: "cyan",
    scene: "harbor",
  },
  {
    id: "p11",
    title: "서면 골목 음식",
    takenAt: "2025-06-16T19:40:00",
    lat: 35.1578,
    lng: 129.0592,
    countryId: "kr",
    provinceId: "gyeongsang",
    locationLabel: "부산광역시 부산진구 서면로",
    districtLabel: "부산진구",
    category: "red",
    scene: "food",
  },
  {
    id: "p12",
    title: "성산 일출",
    takenAt: "2023-05-05T05:42:00",
    lat: 33.4584,
    lng: 126.9425,
    countryId: "kr",
    provinceId: "jeju",
    locationLabel: "제주특별자치도 서귀포시 성산읍",
    districtLabel: "성산읍",
    category: "red",
    scene: "mountain",
  },
  {
    id: "p13",
    title: "협재 바다",
    takenAt: "2023-05-07T13:20:00",
    lat: 33.3941,
    lng: 126.2396,
    countryId: "kr",
    provinceId: "jeju",
    locationLabel: "제주특별자치도 제주시 한림읍",
    districtLabel: "한림읍",
    category: null,
    scene: "beach",
  },
  {
    id: "p14",
    title: "도쿄 저녁",
    takenAt: "2024-04-02T18:10:00",
    lat: 35.6762,
    lng: 139.6503,
    countryId: "jp",
    provinceId: "other",
    locationLabel: "東京都 渋谷区",
    districtLabel: "渋谷",
    category: "pink",
    scene: "skyline",
  },
  {
    id: "p15",
    title: "뉴욕 첫눈",
    takenAt: "2024-11-11T09:05:00",
    lat: 40.758,
    lng: -73.9855,
    countryId: "us",
    provinceId: "other",
    locationLabel: "Manhattan, New York",
    districtLabel: "Manhattan",
    category: "cyan",
    scene: "snow",
  },
  {
    id: "p16",
    title: "베이징 사원",
    takenAt: "2023-10-01T09:30:00",
    lat: 39.882,
    lng: 116.407,
    countryId: "cn",
    provinceId: "other",
    locationLabel: "北京市 东城区",
    districtLabel: "东城",
    category: "red",
    scene: "temple",
  },
];

/** 타임피커 기본 연도: "가장 최근 사진이 찍힌 연도" */
export function latestPhotoYear(photos: Photo[] = MOCK_PHOTOS): number {
  return photos.reduce((max, photo) => {
    const year = new Date(photo.takenAt).getFullYear();
    return Math.max(max, year);
  }, 1970);
}

export function uniquePhotoYears(photos: Photo[] = MOCK_PHOTOS): number[] {
  const years = new Set(photos.map((photo) => new Date(photo.takenAt).getFullYear()));
  return [...years].sort((a, b) => a - b);
}
