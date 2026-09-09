# 시공간 앨범 — 지도

사진의 시간과 공간을 Mapbox 위에 세 단계로 보여 줍니다. 국가 줌은 육지 도트 격자, 시·구 줌은 사진 좌표 원, 동·거리 줌은 위성 지도와 사진 핀입니다.

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

휠 · 트랙패드 · 핀치가 Mapbox 기본 연속 줌입니다. 움직이는 동안에는 레이어를 다시 계산하지 않고, **줌 7.0 / 9.5를 넘고 손을 뗐을 때만** `visibility` 를 한 번 바꿉니다.

| 줌 | 레이어 |
| --- | --- |
| **0.0 ~ 7.0** | 배경 도트 격자. 점 크기는 고정, 밀도는 opacity |
| **7.0 ~ 9.5** | 배경 격자 숨김 + 사진 좌표 Circle |
| **9.5+** | 모든 도트 `visibility: none` + 위성/도로 + 묶음·개별 핀 |

스타일은 `src/lib/map-style.ts` 한 벌입니다. `setStyle` 로 갈아끼우지 않습니다.
