# 수정사항 — 이창현 (Changhyun_v2 / 0617)

---

## 신규 추가 파일

| 파일 | 설명 |
|---|---|
| `frontend/src/components/RouteThumbnail.jsx` | 경로 좌표 배열을 SVG 미니맵 썸네일로 그리는 컴포넌트 (외부 의존성·API 키 없음, 도형별 색상 구분) |
| `frontend/src/utils/communityModule.js` | 커뮤니티(러닝 코스 공유) 저장소 및 로직 — 공유·좋아요·다운로드·정렬·필터(전체/내 글/좋아요)·현 위치 저장. localStorage 기반 로컬 시뮬레이션 |
| `frontend/src/hooks/useCommunity.js` | 커뮤니티 전체/내 글/좋아요 세 목록을 한 번에 관리하는 React 상태 관리 커스텀 훅 |

---

## 기존 파일 수정 내역

### `frontend/src/utils/routeModule.js`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| 최근 경로 LRU 최대 저장 개수 3개 → 10개로 확대 | `LRU_MAX` |
| LRUCache 클래스 설명 주석의 개수 표기(3개→10개) 갱신 | 클래스 헤더 주석 |

### `frontend/src/components/RouteListPage.jsx`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| RouteThumbnail, useCommunity, communityModule import 추가 | `RouteThumbnail`, `useCommunity`, `SORT_OPTIONS`, `getMyLocation` |
| 모든 경로 카드에 SVG 미니맵 썸네일 표시 | `RouteCard`, `RouteThumbnail` |
| 카드에 📤 공유하기 버튼 + 소개글 입력창 추가 → 커뮤니티 등록 | `RouteCard`, `onShare`, `handleShare()` |
| 커뮤니티 전용 게시물 카드 신규 추가 (좋아요·다운로드 수, 작성자, 소개글) | `CommunityCard` |
| 커뮤니티 글 삭제 시 확인 알림 추가 (기존 즉시 삭제 → 확인 후 삭제로 변경) | `CommunityCard`, `confirmDel` |
| 🌍 커뮤니티 탭 추가 (3번째 탭) | `tab === 'community'` |
| 커뮤니티 하위 보기 토글 추가 — 전체 / 내가 올린 / 내가 좋아하는 코스 | `communityView` |
| 4종 정렬(최신순/가까운순/좋아요순/다운로드순) UI 추가 | `SORT_LABELS`, `setAllSort`/`setMineSort`/`setLikedSort` |
| 단일 useCommunity 훅으로 통합 — 한쪽에서 좋아요 변경 시 모든 화면 즉시 미러링 | `useCommunity()` |
| 공유 완료 토스트 알림 추가 | `shareToast` |
| 페이지 최상위 wrapper에 스크롤바 거터 적용 — 탭 전환 시 화면 좌우 치우침 방지 | `scrollbarGutter: 'stable'` |
| 사용되지 않던 onLoadRoute prop 제거 (정리) | `RouteListPage` props |

### `frontend/src/pages/RouteGeneratorPage.jsx`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| saveMyLocation import 추가 | `saveMyLocation` |
| GPX 내보내기 시 현재 시작점을 '현 위치'로 저장 — 커뮤니티 '가까운 순' 정렬 기준점 | `exportGPX()` |

### `frontend/src/index.css`

| 수정 내용 | 관련 함수/변수 |
|---|---|
| 전역 html에 스크롤바 거터 고정 — 페이지마다 스크롤바 유무가 바뀌어도 콘텐츠 좌우 흔들림 방지 | `html { scrollbar-gutter: stable }` |

---

## 기능 요약

### 1. 최근 경로 저장 개수 확대 (3개 → 10개)
LRU Cache의 최대 용량 상수만 조정. 자료구조·알고리즘은 기존과 동일(이중 연결 리스트 + 해시맵).

### 2. SVG 미니맵 썸네일
GPX 저장 시 이미 저장되는 경로 좌표(`coordinates`)를 그대로 활용해 카드마다 경로 윤곽을 SVG로 렌더링. 별도 이미지 저장이나 외부 지도 API·키가 필요 없으며, 도형 종류(heart/star/bone)에 따라 선 색상을 구분한다. 최근 경로·즐겨찾기·커뮤니티 카드 전체에 적용.
※ 실제 배포 단계에서는 정적 지도 이미지 API로 교체해 지도 배경까지 표시 가능.

### 3. 커뮤니티 (러닝 코스 공유)
최근 경로/즐겨찾기에서 📤 공유하기로 소개글과 함께 코스를 등록하고, 좋아요·다운로드 수와 4종 정렬을 지원하는 SNS형 공유 게시판.

- **하위 보기 3종**: 🌍 전체 코스 / 🙋 내가 올린 코스 / ❤️ 내가 좋아하는 코스
- **정렬 4종**: 날짜별 최신순 / 현 위치에서 가까운 순 / 좋아요 순 / 다운로드 순
- **좋아요·다운로드**: 좋아요 토글, 다운로드(GPX 저장) 시 카운트 증가
- **데이터 동기화(미러링)**: 단일 훅에서 세 목록을 함께 관리하여, 어느 화면에서 좋아요/다운로드/공유/삭제를 해도 전체·내 글·좋아요 목록에 즉시 반영
- **삭제 확인창**: 내가 올린 글 삭제 시 최근/즐겨찾기와 동일한 확인 알림 표시
- **샘플 코스**: 최초 실행 시 빈 목록 대신 시드 코스 3개(한강 하트·올림픽공원 별·탄천 뼈다귀) 제공

**구현 방식 (로컬 시뮬레이션)**: 중앙 서버 DB 없이 localStorage로 "커뮤니티가 있는 것처럼" 동작. 좋아요·다운로드 카운트, 정렬, 필터 모두 실제로 동작하지만 같은 브라우저 안에서만 공유된다.
※ 실제 배포 단계에서는 communityModule의 저장/조회를 서버 API 호출로 교체하면 동일 UI로 진짜 SNS 공유가 가능하다.

### 4. '현 위치' 기준 (커뮤니티 가까운 순 정렬)
React Router로 페이지가 분리되어 시작점이 페이지 간 직접 전달되지 않으므로, GPX 저장 시점의 시작점을 localStorage에 기록해 두고 '가까운 순' 정렬의 기준점으로 사용한다.
※ 실제 배포 단계에서는 navigator.geolocation 기반의 실제 GPS 좌표로 대체된다.

### 5. 레이아웃 안정화
탭마다 목록 길이가 달라 스크롤바 유무가 바뀌면 화면이 좌우로 치우치던 문제를, `scrollbar-gutter: stable`로 항상 스크롤바 공간을 확보해 해결.

---

## 사용 자료구조 / 알고리즘 (신규 분)

| 구분 | 내용 |
|---|---|
| 해시맵(Set) | 좋아요한 글 id 집합 — 중복 좋아요 방지 및 좋아요 목록 필터 O(1) 조회 |
| 배열(Array) + 정렬(Sort) | 커뮤니티 게시물 4종 정렬(최신/거리/좋아요/다운로드) |
| 직렬화(Serialization) | 커뮤니티 게시물·좋아요 집합·현 위치를 JSON으로 localStorage 영속 저장 |
| 좌표 정규화 | 경로 좌표의 위·경도 범위를 SVG 좌표계로 변환해 썸네일 렌더링 |
