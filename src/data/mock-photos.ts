import type { CategoryColor, Photo, PhotoScene, ProvinceId } from "@/types/album";

/**
 * 테스트용 사진 500장(한반도 전국) + 해외 3장 + 위치 미지정 3장.
 * 위치는 수도권·강원·충청·전라·경상·제주에 고르게, 날짜는 2024-01 ~ 2026-09 에 흩어집니다.
 */

type Hub = {
  name: string;
  lat: number;
  lng: number;
  provinceId: ProvinceId;
  locationLabel: string;
  districtLabel: string;
  jitter: number;
};

const HUBS: Hub[] = [
  { name: "성수", lat: 37.5447, lng: 127.0559, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 성동구 성수동", districtLabel: "성동구", jitter: 0.012 },
  { name: "강남", lat: 37.4979, lng: 127.0276, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 강남구 역삼동", districtLabel: "강남구", jitter: 0.012 },
  { name: "홍대", lat: 37.5563, lng: 126.9236, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 마포구 서교동", districtLabel: "마포구", jitter: 0.01 },
  { name: "종로", lat: 37.5729, lng: 126.9794, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 종로구", districtLabel: "종로구", jitter: 0.01 },
  { name: "수원", lat: 37.2636, lng: 127.0286, provinceId: "seoul-gyeonggi", locationLabel: "경기도 수원시", districtLabel: "수원시", jitter: 0.014 },
  { name: "인천", lat: 37.4563, lng: 126.7052, provinceId: "seoul-gyeonggi", locationLabel: "인천광역시 남동구", districtLabel: "남동구", jitter: 0.014 },
  { name: "고양", lat: 37.6584, lng: 126.832, provinceId: "seoul-gyeonggi", locationLabel: "경기도 고양시", districtLabel: "고양시", jitter: 0.014 },
  { name: "성남", lat: 37.4201, lng: 127.1265, provinceId: "seoul-gyeonggi", locationLabel: "경기도 성남시", districtLabel: "성남시", jitter: 0.012 },
  { name: "용인", lat: 37.2411, lng: 127.1776, provinceId: "seoul-gyeonggi", locationLabel: "경기도 용인시", districtLabel: "용인시", jitter: 0.016 },
  { name: "의정부", lat: 37.7381, lng: 127.0337, provinceId: "seoul-gyeonggi", locationLabel: "경기도 의정부시", districtLabel: "의정부시", jitter: 0.012 },
  { name: "강릉", lat: 37.7519, lng: 128.8761, provinceId: "gangwon", locationLabel: "강원특별자치도 강릉시", districtLabel: "강릉시", jitter: 0.016 },
  { name: "속초", lat: 38.207, lng: 128.5918, provinceId: "gangwon", locationLabel: "강원특별자치도 속초시", districtLabel: "속초시", jitter: 0.012 },
  { name: "춘천", lat: 37.8813, lng: 127.7298, provinceId: "gangwon", locationLabel: "강원특별자치도 춘천시", districtLabel: "춘천시", jitter: 0.014 },
  { name: "평창", lat: 37.3705, lng: 128.39, provinceId: "gangwon", locationLabel: "강원특별자치도 평창군", districtLabel: "평창군", jitter: 0.03 },
  { name: "원주", lat: 37.3422, lng: 127.9202, provinceId: "gangwon", locationLabel: "강원특별자치도 원주시", districtLabel: "원주시", jitter: 0.014 },
  { name: "동해", lat: 37.5247, lng: 129.1143, provinceId: "gangwon", locationLabel: "강원특별자치도 동해시", districtLabel: "동해시", jitter: 0.012 },
  { name: "양양", lat: 38.0754, lng: 128.619, provinceId: "gangwon", locationLabel: "강원특별자치도 양양군", districtLabel: "양양군", jitter: 0.016 },
  { name: "삼척", lat: 37.4499, lng: 129.1652, provinceId: "gangwon", locationLabel: "강원특별자치도 삼척시", districtLabel: "삼척시", jitter: 0.014 },
  { name: "대전", lat: 36.3504, lng: 127.3845, provinceId: "chungcheong", locationLabel: "대전광역시 유성구", districtLabel: "유성구", jitter: 0.014 },
  { name: "천안", lat: 36.8151, lng: 127.1139, provinceId: "chungcheong", locationLabel: "충청남도 천안시", districtLabel: "천안시", jitter: 0.014 },
  { name: "청주", lat: 36.6424, lng: 127.489, provinceId: "chungcheong", locationLabel: "충청북도 청주시", districtLabel: "청주시", jitter: 0.014 },
  { name: "충주", lat: 36.991, lng: 127.926, provinceId: "chungcheong", locationLabel: "충청북도 충주시", districtLabel: "충주시", jitter: 0.016 },
  { name: "공주", lat: 36.4465, lng: 127.119, provinceId: "chungcheong", locationLabel: "충청남도 공주시", districtLabel: "공주시", jitter: 0.014 },
  { name: "보령", lat: 36.3332, lng: 126.6129, provinceId: "chungcheong", locationLabel: "충청남도 보령시", districtLabel: "보령시", jitter: 0.016 },
  { name: "세종", lat: 36.4801, lng: 127.289, provinceId: "chungcheong", locationLabel: "세종특별자치시", districtLabel: "세종", jitter: 0.014 },
  { name: "아산", lat: 36.7898, lng: 127.0018, provinceId: "chungcheong", locationLabel: "충청남도 아산시", districtLabel: "아산시", jitter: 0.014 },
  { name: "광주", lat: 35.1595, lng: 126.8526, provinceId: "jeolla", locationLabel: "광주광역시 동구", districtLabel: "동구", jitter: 0.014 },
  { name: "전주", lat: 35.8242, lng: 127.148, provinceId: "jeolla", locationLabel: "전북특별자치도 전주시", districtLabel: "완산구", jitter: 0.012 },
  { name: "여수", lat: 34.7604, lng: 127.6622, provinceId: "jeolla", locationLabel: "전라남도 여수시", districtLabel: "여수시", jitter: 0.016 },
  { name: "목포", lat: 34.8118, lng: 126.3922, provinceId: "jeolla", locationLabel: "전라남도 목포시", districtLabel: "목포시", jitter: 0.012 },
  { name: "순천", lat: 34.9506, lng: 127.4872, provinceId: "jeolla", locationLabel: "전라남도 순천시", districtLabel: "순천시", jitter: 0.014 },
  { name: "군산", lat: 35.9677, lng: 126.7369, provinceId: "jeolla", locationLabel: "전북특별자치도 군산시", districtLabel: "군산시", jitter: 0.014 },
  { name: "남원", lat: 35.4164, lng: 127.3904, provinceId: "jeolla", locationLabel: "전북특별자치도 남원시", districtLabel: "남원시", jitter: 0.016 },
  { name: "담양", lat: 35.3214, lng: 126.988, provinceId: "jeolla", locationLabel: "전라남도 담양군", districtLabel: "담양군", jitter: 0.016 },
  { name: "해운대", lat: 35.1586, lng: 129.1604, provinceId: "gyeongsang", locationLabel: "부산광역시 해운대구", districtLabel: "해운대구", jitter: 0.012 },
  { name: "서면", lat: 35.1578, lng: 129.0592, provinceId: "gyeongsang", locationLabel: "부산광역시 부산진구", districtLabel: "부산진구", jitter: 0.01 },
  { name: "대구", lat: 35.8714, lng: 128.6014, provinceId: "gyeongsang", locationLabel: "대구광역시 중구", districtLabel: "중구", jitter: 0.014 },
  { name: "울산", lat: 35.5384, lng: 129.3114, provinceId: "gyeongsang", locationLabel: "울산광역시 남구", districtLabel: "남구", jitter: 0.014 },
  { name: "경주", lat: 35.8562, lng: 129.2247, provinceId: "gyeongsang", locationLabel: "경상북도 경주시", districtLabel: "경주시", jitter: 0.018 },
  { name: "포항", lat: 36.019, lng: 129.3435, provinceId: "gyeongsang", locationLabel: "경상북도 포항시", districtLabel: "포항시", jitter: 0.016 },
  { name: "창원", lat: 35.2279, lng: 128.6819, provinceId: "gyeongsang", locationLabel: "경상남도 창원시", districtLabel: "창원시", jitter: 0.016 },
  { name: "진주", lat: 35.18, lng: 128.1076, provinceId: "gyeongsang", locationLabel: "경상남도 진주시", districtLabel: "진주시", jitter: 0.014 },
  { name: "안동", lat: 36.5684, lng: 128.7294, provinceId: "gyeongsang", locationLabel: "경상북도 안동시", districtLabel: "안동시", jitter: 0.016 },
  { name: "통영", lat: 34.8544, lng: 128.4331, provinceId: "gyeongsang", locationLabel: "경상남도 통영시", districtLabel: "통영시", jitter: 0.014 },
  { name: "제주", lat: 33.4996, lng: 126.5312, provinceId: "jeju", locationLabel: "제주특별자치도 제주시", districtLabel: "제주시", jitter: 0.016 },
  { name: "서귀포", lat: 33.2541, lng: 126.56, provinceId: "jeju", locationLabel: "제주특별자치도 서귀포시", districtLabel: "서귀포시", jitter: 0.016 },
  { name: "성산", lat: 33.4584, lng: 126.9425, provinceId: "jeju", locationLabel: "제주특별자치도 서귀포시 성산읍", districtLabel: "성산읍", jitter: 0.012 },
  { name: "협재", lat: 33.3941, lng: 126.2396, provinceId: "jeju", locationLabel: "제주특별자치도 제주시 한림읍", districtLabel: "한림읍", jitter: 0.012 },
  { name: "중문", lat: 33.2457, lng: 126.412, provinceId: "jeju", locationLabel: "제주특별자치도 서귀포시 중문", districtLabel: "중문", jitter: 0.012 },
  { name: "애월", lat: 33.462, lng: 126.31, provinceId: "jeju", locationLabel: "제주특별자치도 제주시 애월읍", districtLabel: "애월읍", jitter: 0.014 },
];

const PER_HUB = 10;
const KOREA_PHOTO_COUNT = HUBS.length * PER_HUB;

const SCENES: PhotoScene[] = [
  "street",
  "cafe",
  "city-night",
  "food",
  "park",
  "sunset",
  "blossom",
  "skyline",
  "beach",
  "harbor",
  "mountain",
  "fire",
  "snow",
  "temple",
  "river",
];

const SCENE_TITLE: Record<PhotoScene, string> = {
  street: "골목",
  cafe: "카페",
  "city-night": "야경",
  food: "식사",
  park: "공원",
  sunset: "노을",
  blossom: "꽃",
  skyline: "스카이라인",
  beach: "바다",
  harbor: "항구",
  mountain: "산",
  fire: "불빛",
  snow: "눈",
  temple: "사찰",
  river: "강",
};

const KEY_COLORS: Exclude<CategoryColor, null>[] = ["pink", "green", "cyan", "red"];

const RANGE_START = Date.UTC(2024, 0, 1, 8, 0, 0);
const RANGE_END = Date.UTC(2026, 8, 13, 20, 0, 0);

function unit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function takenAtForIndex(index: number): string {
  const u = unit(index * 11.17);
  const ms = RANGE_START + u * (RANGE_END - RANGE_START);
  if (index % 7 === 0) {
    const day = 1 + Math.floor(unit(index * 4.3) * 13);
    const hour = 8 + Math.floor(unit(index * 9.1) * 12);
    return `2026-09-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(10 + (index % 50)).padStart(2, "0")}:00`;
  }
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}T${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:00`;
}

function buildKoreaPhotos(): Photo[] {
  const photos: Photo[] = [];
  let index = 0;
  HUBS.forEach((hub, hubIndex) => {
    for (let i = 0; i < PER_HUB; i += 1) {
      index += 1;
      const scene = SCENES[(index + hubIndex) % SCENES.length]!;
      const category = KEY_COLORS[Math.floor(unit(index * 5.91) * KEY_COLORS.length)]!;
      const latJ = (unit(index * 3.1) - 0.5) * 2 * hub.jitter;
      const lngJ = (unit(index * 7.7) - 0.5) * 2 * hub.jitter;
      photos.push({
        id: `p${String(index).padStart(3, "0")}`,
        title: `${hub.name} ${SCENE_TITLE[scene]}`,
        takenAt: takenAtForIndex(index),
        lat: hub.lat + latJ,
        lng: hub.lng + lngJ,
        countryId: "kr",
        provinceId: hub.provinceId,
        locationLabel: hub.locationLabel,
        districtLabel: hub.districtLabel,
        category,
        scene,
      });
    }
  });
  return photos;
}

const KOREA_PHOTOS = buildKoreaPhotos();

const OVERSEAS: Photo[] = [
  {
    id: "p-os-1",
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
    id: "p-os-2",
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
    id: "p-os-3",
    title: "베이징 사원",
    takenAt: "2025-10-01T09:30:00",
    lat: 39.882,
    lng: 116.407,
    countryId: "cn",
    provinceId: "other",
    locationLabel: "北京市 东城区",
    districtLabel: "동청",
    category: "red",
    scene: "temple",
  },
];

const UNLOCATED_PHOTOS: Photo[] = [
  {
    id: "p-nloc-1",
    title: "위치 없는 스냅",
    takenAt: "2025-08-12T14:20:00",
    lat: 0,
    lng: 0,
    countryId: "kr",
    provinceId: "other",
    locationLabel: "위치 정보 없음",
    districtLabel: "미지정",
    category: "green",
    scene: "street",
    hasGps: false,
  },
  {
    id: "p-nloc-2",
    title: "EXIF 없는 카페",
    takenAt: "2025-03-04T11:05:00",
    lat: 0,
    lng: 0,
    countryId: "kr",
    provinceId: "other",
    locationLabel: "위치 정보 없음",
    districtLabel: "미지정",
    category: "pink",
    scene: "cafe",
    hasGps: false,
  },
  {
    id: "p-nloc-3",
    title: "좌표 누락 노을",
    takenAt: "2024-12-21T17:40:00",
    lat: 0,
    lng: 0,
    countryId: "kr",
    provinceId: "other",
    locationLabel: "위치 정보 없음",
    districtLabel: "미지정",
    category: "red",
    scene: "sunset",
    hasGps: false,
  },
];

export const MOCK_PHOTOS: Photo[] = [...KOREA_PHOTOS, ...OVERSEAS, ...UNLOCATED_PHOTOS];

export const KOREA_PLACE_OPTIONS = HUBS.map((hub) => ({
  id: hub.name,
  name: hub.name,
  lat: hub.lat,
  lng: hub.lng,
  locationLabel: hub.locationLabel,
  districtLabel: hub.districtLabel,
  provinceId: hub.provinceId,
}));

export const KOREA_MOCK_COUNT = KOREA_PHOTO_COUNT;

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
