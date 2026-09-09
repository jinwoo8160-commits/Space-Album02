# 시공간 앨범 — 지도

사진의 시간과 공간을 **Mapbox 지형 위의 도트 격자**로 보여 줍니다. 도로·라벨·위성 타일은 숨기고, 수역 폴리곤의 반대편(육지)에만 연한 회색 점을 심습니다. 사진이 모인 곳은 점이 더 진해집니다.

## 실행

```bash
cp .env.example .env.local
# .env.local 에 Mapbox 토큰을 넣습니다.
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

토큰은 [Mapbox 계정](https://account.mapbox.com/access-tokens/)에서 발급하고 `NEXT_PUBLIC_MAPBOX_TOKEN` 으로 등록합니다. 코드는 `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` 만 읽습니다.

## 줌 (연속)

휠 · 트랙패드 · 핀치가 Mapbox 기본 연속 줌입니다. 단계 버튼으로 끊지 않습니다.

| 줌 | 레이어 |
| --- | --- |
| **0 ~ 5** | 육지 도트 격자. 점 크기는 고정, 진하기만 사진 밀도 |
| **6 ~ 11** | 도트 디졸브 아웃 → 묶음 핀 디졸브 인 |
| **12+** | 개별 사진 핀 |

스타일은 `src/lib/map-style.ts` 의 흰 캔버스 + 수역 쿼리 레이어입니다. 격자는 `src/lib/land-dots.ts` 가 뷰포트 픽셀 격자로 만듭니다.
