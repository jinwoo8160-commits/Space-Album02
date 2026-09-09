import type { CountryId, GeoBounds, ProvinceId } from "@/types/album";

/**
 * 도트 맵은 실제 GeoJSON 대신 "문자 그림(마스크)"으로 만듭니다.
 *
 * 왜 ASCII 마스크를 쓰나요?
 * - 초보자가 "이 칸이 육지인가?"를 눈으로 바로 확인할 수 있습니다.
 * - 시/도 경계는 글자 종류(S/G/C/...)로 표현되므로, 줌 레벨 2에서 간격을 띄우기 쉽습니다.
 * - API 키 없이 스케치의 점묘 지도를 재현할 수 있습니다.
 *
 * 문자 규칙 (대한민국):
 *  S 서울/경기   G 강원   C 충청   J 전라   Y 경상   E 제주
 *  공백은 바다.
 */

export type CountryMeta = {
  id: CountryId;
  name: string;
  nameEn: string;
  bounds: GeoBounds;
  mask: string[];
};

const KR_MASK = [
  "                              ",
  "            GGG               ",
  "          GGGGGGG             ",
  "         GGGGGGGGG            ",
  "        GGGGGGGGGGG           ",
  "       GGGGGGGGGGGG           ",
  "       SSSSSSGGGGGGG          ",
  "      SSSSSSSSGGGGGG          ",
  "     SSSSSSSSSGGGGGG          ",
  "     SSSSSSSSGGGGGGG          ",
  "     SSSSSSSSGGGGGG           ",
  "     SSSSSSSCGGGGGG           ",
  "     SSSSSSCCGGGGG            ",
  "     SSSSSCCCYYYYY            ",
  "      SSSCCCCYYYYYY           ",
  "      SSCCCCCYYYYYY           ",
  "      SCCCCCCYYYYYYY          ",
  "      CCCCCCCYYYYYYY          ",
  "      CCCCCCYYYYYYYY          ",
  "      CCCCJJYYYYYYYY          ",
  "      CCCJJJYYYYYYYY          ",
  "      CCJJJJYYYYYYYY          ",
  "       CJJJJYYYYYYY           ",
  "       JJJJYYYYYYYY           ",
  "       JJJYYYYYYYY            ",
  "       JJYYYYYYYY             ",
  "        JYYYYYYY              ",
  "        JYYYYYY               ",
  "         YYYYY                ",
  "          YYY                 ",
  "                              ",
  "           EE                 ",
  "          EEEE                ",
  "           EE                 ",
  "                              ",
];

const JP_MASK = [
  "                    ....      ",
  "                   ......     ",
  "                    ....      ",
  "                              ",
  "                 ..           ",
  "                ...           ",
  "               ....           ",
  "              .....           ",
  "             ......           ",
  "            ......            ",
  "           ......             ",
  "          ......              ",
  "         ......               ",
  "        ......                ",
  "       ......                 ",
  "      .....                   ",
  "     ....                     ",
  "    ....   ..                 ",
  "   ....   ...                 ",
  "  ...      ..                 ",
  " ...                          ",
  "..                            ",
];

const CN_MASK = [
  "      ..........              ",
  "     ..............           ",
  "    .................         ",
  "   ....................       ",
  "   .....................      ",
  "  .......................     ",
  "  .......................     ",
  "  .......................     ",
  "   ......................     ",
  "   ......................     ",
  "    ....................      ",
  "    ...................       ",
  "     .................        ",
  "      ...............         ",
  "       .............          ",
  "        ........              ",
  "         ......               ",
  "          ....                ",
];

const US_MASK = [
  "                              ",
  "   .....................      ",
  "  .......................     ",
  "  .......................     ",
  "  .......................     ",
  "  .......................     ",
  "   ......................     ",
  "   .....................      ",
  "    ..........  ........      ",
  "     .........   .......      ",
  "      ........    ...         ",
  "       .......     ..         ",
  "        .....       .         ",
  "         ...                  ",
  "                              ",
];

const WORLD_MASK = [
  "                              ",
  "    ....         .            ",
  "   ......      ....  ..       ",
  "  ........    .........       ",
  "   .......    ..........      ",
  "    .....      .........      ",
  "     ...        .......       ",
  "         ..       ....        ",
  "        ...       ...         ",
  "        ...        ..         ",
  "         ..                   ",
  "                              ",
  "                    ..        ",
  "                   ...        ",
  "                    .         ",
];

export const COUNTRIES: CountryMeta[] = [
  {
    id: "kr",
    name: "대한민국",
    nameEn: "Korea",
    bounds: { minLat: 33.0, maxLat: 43.0, minLng: 124.0, maxLng: 132.0 },
    mask: KR_MASK,
  },
  {
    id: "jp",
    name: "일본",
    nameEn: "Japan",
    bounds: { minLat: 30.2, maxLat: 45.6, minLng: 128.4, maxLng: 146.2 },
    mask: JP_MASK,
  },
  {
    id: "cn",
    name: "중국",
    nameEn: "China",
    bounds: { minLat: 18.1, maxLat: 53.6, minLng: 73.4, maxLng: 135.1 },
    mask: CN_MASK,
  },
  {
    id: "us",
    name: "미국",
    nameEn: "USA",
    bounds: { minLat: 24.4, maxLat: 49.4, minLng: -125.1, maxLng: -66.8 },
    mask: US_MASK,
  },
];

export const WORLD_COUNTRY: CountryMeta = {
  id: "kr",
  name: "세계",
  nameEn: "World",
  bounds: { minLat: -50, maxLat: 75, minLng: -130, maxLng: 160 },
  mask: WORLD_MASK,
};

const PROVINCE_BY_CHAR: Record<string, ProvinceId> = {
  S: "seoul-gyeonggi",
  G: "gangwon",
  C: "chungcheong",
  J: "jeolla",
  Y: "gyeongsang",
  E: "jeju",
};

export function charToProvince(ch: string): ProvinceId {
  return PROVINCE_BY_CHAR[ch] ?? "other";
}

export const COUNTRY_BY_ID: Record<CountryId, CountryMeta> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c]),
) as Record<CountryId, CountryMeta>;
