# 수정사항 — 이창현 (Changhyun_v2)

---

## 신규 추가 파일

| 파일 | 설명 |
|---|---|
| `frontend/src/utils/routeModule.js` | LRU Cache 기반 최근 경로 관리, 즐겨찾기 저장, GPX 내보내기 핵심 로직 |
| `frontend/src/hooks/useRouteList.js` | 최근 경로·즐겨찾기 React 상태 관리 커스텀 훅 |
| `frontend/src/components/RouteListPage.jsx` | 경로 목록 페이지 UI (최근 생성 경로 / 즐겨찾는 경로 탭) |

---

## 기존 파일 수정 내역

### `frontend/src/App.jsx`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| useMemo import 추가 — fullPathCoordinates 매 렌더링 재계산 방지 | `useMemo` |
| RouteListPage, routeModule import 추가 | `RouteListPage`, `exportGPXWithLRU` |
| GPX 내보내기 확인 알림 state 추가 | `showGpxConfirm` |
| 경로 목록 페이지 표시 state 추가 | `showList` |
| 지도 클릭 즉시 도로 데이터 로드 → 버튼 클릭 시에만 로드하도록 분리 | `handleGenerateRoute()` |
| GPX 버튼 클릭 시 확인 알림 표시 함수 추가 | `handleGpxButtonClick()` |
| 기존 exportGPXFile → LRU 자동 저장 기능 포함 버전으로 교체 | `exportGPX()` |
| fullPathCoordinates useMemo 적용 — graph 변경 시에만 재계산 | `fullPathCoordinates` |
| 경로 목록 페이지 조건부 렌더링 추가 | `RouteListPage` |
| 📋 최근 생성 경로 / 즐겨찾는 경로 버튼 추가 (상단) | 상단 버튼 |
| 🚀 경로 생성하기 버튼 추가 (지도 하단) | 지도 하단 버튼 |
| GPX 확인 알림 팝업 UI 추가 | `showGpxConfirm` |

### `frontend/src/components/ClickHandler.jsx`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| 클릭 즉시 도로 데이터 로드 로직 제거 — 버튼 분리로 불필요 | `fetchGraph`, `setRoadGraph`, `setGraph` props 제거 |
| 드래그/클릭 구분 로직 추가 — mousedown 위치 기록 후 이동 거리 5px 이상 시 클릭 무시 | `mouseDownPos` (useRef), `mousedown` 이벤트 |
| 클릭 시 시작점만 설정하도록 변경 | `setStartPoint` |

### `frontend/src/components/MapView.jsx`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| fetchGraph, setRoadGraph, setGraph props 제거 — App.jsx로 이동 | props 정리 |
| 도로 데이터 로딩 중 오버레이 안내 추가 | `loading` 조건부 렌더링 |
| 시작 지점 미설정 시 클릭 안내 문구 추가 | `!startPoint` 조건부 렌더링 |
| ClickHandler에 fetchGraph 전달 제거 | ClickHandler props 정리 |
