import type { CategoryColor, Photo, PhotoScene, ProvinceId } from "@/types/album";

/**
 * 테스트용 사진 100장(한반도) + 해외 3장.
 *
 * 서울·수도권에 몰아 넣어 국가 줌에서 북서가 1단계(가장 짙음)가 되고,
 * 부산이 그다음, 제주·강원·소도시는 1~2장씩 흩어져 4~5단계가 됩니다.
 * 기본 연도 필터(최신 연도)에도 밀도가 보이도록 2025 장을 많이 둡니다.
 */

type Hub = {
  name: string;
  lat: number;
  lng: number;
  count: number;
  jitter: number;
  provinceId: ProvinceId;
  locationLabel: string;
  districtLabel: string;
  pinExactFirst?: boolean;
};

const HUBS: Hub[] = [
  { name: "성수", lat: 37.5447, lng: 127.0559, count: 11, jitter: 0.01, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 성동구 성수동", districtLabel: "성동구", pinExactFirst: true },
  { name: "강남", lat: 37.4979, lng: 127.0276, count: 8, jitter: 0.011, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 강남구 역삼동", districtLabel: "강남구" },
  { name: "홍대", lat: 37.5563, lng: 126.9236, count: 6, jitter: 0.009, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 마포구 서교동", districtLabel: "마포구" },
  { name: "잠실", lat: 37.5133, lng: 127.1028, count: 5, jitter: 0.009, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 송파구 잠실동", districtLabel: "송파구" },
  { name: "종로", lat: 37.5729, lng: 126.9794, count: 4, jitter: 0.008, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 종로구 종로", districtLabel: "종로구" },
  { name: "여의도", lat: 37.5219, lng: 126.9245, count: 3, jitter: 0.007, provinceId: "seoul-gyeonggi", locationLabel: "서울특별시 영등포구 여의도동", districtLabel: "영등포구" },
  { name: "수원", lat: 37.2636, lng: 127.0286, count: 3, jitter: 0.012, provinceId: "seoul-gyeonggi", locationLabel: "경기도 수원시 팔달구", districtLabel: "수원시" },
  { name: "판교", lat: 37.3948, lng: 127.1112, count: 2, jitter: 0.007, provinceId: "seoul-gyeonggi", locationLabel: "경기도 성남시 분당구 판교", districtLabel: "성남시" },
  { name: "일산", lat: 37.658, lng: 126.7682, count: 1, jitter: 0.006, provinceId: "seoul-gyeonggi", locationLabel: "경기도 고양시 일산동구", districtLabel: "고양시" },
  { name: "해운대", lat: 35.1586, lng: 129.1604, count: 7, jitter: 0.01, provinceId: "gyeongsang", locationLabel: "부산광역시 해운대구 해운대해변로", districtLabel: "해운대구" },
  { name: "광안리", lat: 35.1532, lng: 129.1185, count: 5, jitter: 0.008, provinceId: "gyeongsang", locationLabel: "부산광역시 수영구 광안해변로", districtLabel: "수영구" },
  { name: "서면", lat: 35.1578, lng: 129.0592, count: 4, jitter: 0.008, provinceId: "gyeongsang", locationLabel: "부산광역시 부산진구 서면로", districtLabel: "부산진구" },
  { name: "남포", lat: 35.0975, lng: 129.0306, count: 2, jitter: 0.007, provinceId: "gyeongsang", locationLabel: "부산광역시 중구 남포동", districtLabel: "중구" },
  { name: "성산", lat: 33.4584, lng: 126.9425, count: 3, jitter: 0.01, provinceId: "jeju", locationLabel: "제주특별자치도 서귀포시 성산읍", districtLabel: "성산읍" },
  { name: "제주", lat: 33.4996, lng: 126.5312, count: 3, jitter: 0.012, provinceId: "jeju", locationLabel: "제주특별자치도 제주시 이도동", districtLabel: "제주시" },
  { name: "협재", lat: 33.3941, lng: 126.2396, count: 2, jitter: 0.008, provinceId: "jeju", locationLabel: "제주특별자치도 제주시 한림읍", districtLabel: "한림읍" },
  { name: "서귀포", lat: 33.2541, lng: 126.56, count: 2, jitter: 0.01, provinceId: "jeju", locationLabel: "제주특별자치도 서귀포시 서귀동", districtLabel: "서귀포시" },
  { name: "강릉", lat: 37.7519, lng: 128.8761, count: 3, jitter: 0.012, provinceId: "gangwon", locationLabel: "강원특별자치도 강릉시 경포로", districtLabel: "강릉시" },
  { name: "속초", lat: 38.207, lng: 128.5918, count: 3, jitter: 0.01, provinceId: "gangwon", locationLabel: "강원특별자치도 속초시 동명동", districtLabel: "속초시" },
  { name: "평창", lat: 37.3705, lng: 128.39, count: 2, jitter: 0.02, provinceId: "gangwon", locationLabel: "강원특별자치도 평창군 대관령", districtLabel: "평창군" },
  { name: "송도", lat: 37.3897, lng: 126.642, count: 2, jitter: 0.008, provinceId: "seoul-gyeonggi", locationLabel: "인천광역시 연수구 송도동", districtLabel: "연수구" },
  { name: "대구", lat: 35.8714, lng: 128.6014, count: 2, jitter: 0.01, provinceId: "gyeongsang", locationLabel: "대구광역시 중구 동성로", districtLabel: "중구" },
  { name: "대전", lat: 36.3504, lng: 127.3845, count: 2, jitter: 0.01, provinceId: "chungcheong", locationLabel: "대전광역시 유성구", districtLabel: "유성구" },
  { name: "광주", lat: 35.1595, lng: 126.8526, count: 2, jitter: 0.01, provinceId: "jeolla", locationLabel: "광주광역시 동구 충장로", districtLabel: "동구" },
  { name: "전주", lat: 35.8242, lng: 127.148, count: 1, jitter: 0, provinceId: "jeolla", locationLabel: "전북특별자치도 전주시 한옥마을", districtLabel: "완산구" },
  { name: "여수", lat: 34.7604, lng: 127.6622, count: 1, jitter: 0, provinceId: "jeolla", locationLabel: "전라남도 여수시 돌산읍", districtLabel: "여수시" },
  { name: "경주", lat: 35.8562, lng: 129.2247, count: 1, jitter: 0, provinceId: "gyeongsang", locationLabel: "경상북도 경주시 황남동", districtLabel: "경주시" },
  { name: "울산", lat: 35.5384, lng: 129.3114, count: 1, jitter: 0, provinceId: "gyeongsang", locationLabel: "울산광역시 남구 삼산동", districtLabel: "남구" },
  { name: "포항", lat: 36.019, lng: 129.3435, count: 1, jitter: 0, provinceId: "gyeongsang", locationLabel: "경상북도 포항시 북구", districtLabel: "포항시" },
  { name: "춘천", lat: 37.8813, lng: 127.7298, count: 1, jitter: 0, provinceId: "gangwon", locationLabel: "강원특별자치도 춘천시 근화동", districtLabel: "춘천시" },
  { name: "천안", lat: 36.8151, lng: 127.1139, count: 1, jitter: 0, provinceId: "chungcheong", locationLabel: "충청남도 천안시 동남구", districtLabel: "천안시" },
  { name: "안동", lat: 36.5684, lng: 128.7294, count: 1, jitter: 0, provinceId: "gyeongsang", locationLabel: "경상북도 안동시 풍천면", districtLabel: "안동시" },
  { name: "통영", lat: 34.8544, lng: 128.4331, count: 1, jitter: 0, provinceId: "gyeongsang", locationLabel: "경상남도 통영시 중앙동", districtLabel: "통영시" },
  { name: "목포", lat: 34.8118, lng: 126.3922, count: 1, jitter: 0, provinceId: "jeolla", locationLabel: "전라남도 목포시 해안로", districtLabel: "목포시" },
  { name: "담양", lat: 35.3214, lng: 126.988, count: 1, jitter: 0, provinceId: "jeolla", locationLabel: "전라남도 담양군 담양읍", districtLabel: "담양군" },
  { name: "양양", lat: 38.0754, lng: 128.619, count: 1, jitter: 0, provinceId: "gangwon", locationLabel: "강원특별자치도 양양군 손양면", districtLabel: "양양군" },
  { name: "동해", lat: 37.5247, lng: 129.1143, count: 1, jitter: 0, provinceId: "gangwon", locationLabel: "강원특별자치도 동해시 발한동", districtLabel: "동해시" },
];

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

const CATEGORIES: CategoryColor[] = ["pink", "green", "cyan", "red", null];

function unit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildKoreaPhotos(): Photo[] {
  const photos: Photo[] = [];
  let index = 0;

  HUBS.forEach((hub, hubIndex) => {
    for (let i = 0; i < hub.count; i += 1) {
      index += 1;
      const scene = SCENES[(index + hubIndex) % SCENES.length]!;
      const category = CATEGORIES[(index + hubIndex * 3) % CATEGORIES.length]!;
      const exact = Boolean(hub.pinExactFirst && i < 2);
      const latJ = exact ? 0 : (unit(index * 3.1) - 0.5) * 2 * hub.jitter;
      const lngJ = exact ? 0 : (unit(index * 7.7) - 0.5) * 2 * hub.jitter;
      const year = index % 10 < 7 ? 2025 : index % 10 < 9 ? 2024 : 2023;
      const month = 1 + Math.floor(unit(index * 1.7) * 12);
      const day = 1 + Math.floor(unit(index * 4.3) * 27);
      const hour = 8 + Math.floor(unit(index * 9.1) * 14);

      photos.push({
        id: `p${String(index).padStart(3, "0")}`,
        title: `${hub.name} ${SCENE_TITLE[scene]}`,
        takenAt: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:10:00`,
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
    id: "p101",
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
    id: "p102",
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
    id: "p103",
    title: "베이징 사원",
    takenAt: "2023-10-01T09:30:00",
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

export const MOCK_PHOTOS: Photo[] = [...KOREA_PHOTOS, ...OVERSEAS];

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
