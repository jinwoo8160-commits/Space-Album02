# 시공간 앨범 — 지도

사진의 시간과 공간을 Mapbox GL JS 미니멀 모노톤 지도 위에 올립니다.

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
| **0 ~ 5** | 2~4px Circle 도트. 밀도는 opacity 만 |
| **6 ~ 11** | 도트 디졸브 아웃 → 묶음 핀 디졸브 인 |
| **12+** | 개별 사진 핀 |

스타일은 `mapbox://styles/mapbox/dark-v11` (`src/lib/map-style.ts`).
