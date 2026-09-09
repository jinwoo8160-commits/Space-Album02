# 시공간 앨범 — 지도 1차 구현

사진이 **언제·어디서** 찍혔는지를 한 화면에서 보는 웹 앱입니다.  
지도 엔진은 **MapLibre GL** (Mapbox GL JS의 오픈소스 후속) 입니다. Circle Layer / GeoJSON Source API가 Mapbox GL과 같아서, 해안선이 있는 실제 회색조 지도 위에 도트·묶음·핀을 올립니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://127.0.0.1:43123](http://127.0.0.1:43123) 을 엽니다.

공식 Mapbox Studio 스타일을 쓰려면 `.env.local`에 스타일 URL을 넣을 수 있습니다.

```bash
NEXT_PUBLIC_MAPBOX_STYLE=https://tiles.openfreemap.org/styles/positron
```

기본값은 OpenFreeMap **Positron**(Mapbox Light와 같은 미니멀 회색조 벡터 지도)입니다. 벡터 타일이 막히면 CARTO 래스터로 자동 전환됩니다.

## 줌 레이어 기준 (엔진 줌 숫자)

| 줌 | 의미 | 레이어 |
| --- | --- | --- |
| **0 ~ 5** | 국가 / 대륙 | 미세 Circle 도트. 점 크기는 2~4px로 고정, **진하기(opacity)만** 사진 밀도에 따라 변경 |
| **6 ~ 11** | 시·도 / 구·군 | 도트 숨김 → 사진 묶음(스택) 핀 |
| **12 이상** | 동 / 거리 | 개별 사진 핀 (같은 좌표만 묶음) |

`+` / `-`, 마우스 휠, 핀치로 줌하면 위 기준에 맞춰 레이어가 자동으로 바뀝니다. 기준표는 `src/lib/zoom.ts` 입니다.

## 데이터 흐름

```
MOCK_PHOTOS  →  photos state
                 → 국가 / 연·월·일 / 컬러핀 필터
                 → filteredPhotos
                      ├─ z 0~5   GeoJSON Circle Layer (밀도 도트)
                      ├─ z 6~11  HTML 묶음 핀
                      └─ z 12+   HTML 개별 핀
```

핵심 파일:

- `src/lib/zoom.ts` — 줌 숫자 ↔ 레이어 전환
- `src/lib/density-dots.ts` — 사진을 작은 격자로 묶어 count 부여
- `src/components/map/AlbumMap.tsx` — MapLibre 지도 + Circle Layer
- `src/context/map-context.tsx` — 필터·선택 사진·지도 ref

## 더미 데이터

`src/data/mock-photos.ts` 에 서울·부산·제주·도쿄·뉴욕·베이징 사진.

## 디자인 TODO

스케치와 픽셀을 더 맞추고 싶은 곳은  
`TODO: [디자인] 첨부 이미지 스타일 반영 위치` 주석을 찾아 조절하면 됩니다.
