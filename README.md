# Shape Runner

## 프로젝트 소개

Shape Runner는 사용자가 원하는 도형(하트, 별, 뼈 모양 등)을 선택하면 실제 도로망 위에서 해당 도형과 유사한 러닝 경로를 자동 생성해주는 웹 애플리케이션입니다.

기존 러닝 앱이 단순히 거리 기반 경로를 제공하는 것과 달리, Shape Runner는 사용자의 운동 경험에 재미 요소를 추가하기 위해 도형 기반 경로 생성 기능을 제공합니다.

또한 생성된 경로에 대해 경로 유사도, 경로 복잡도, 예상 완주 시간, 예상 칼로리 소모량, Zone2 권장 심박수 등의 분석 기능을 제공합니다.

---
## 실행 환경
### 개발 환경
Visual Studio Code (VS Code)
Node.js v22 이상
npm v10 이상

### 실행 환경
Frontend
React 19
Vite

Backend
Node.js
Express

### 필요 라이브러리
#### Frontend
react
react-dom
react-router-dom
react-leaflet
leaflet

설치:
npm install react react-dom react-router-dom react-leaflet leaflet

#### Backend
express
cors
axios
multer
jsonwebtoken
bcrypt

설치:
npm install express cors axios multer jsonwebtoken bcrypt

## 입력 데이터 종류
사용자가 선택한 도형
Heart
Star
Bone
목표 거리(km)
시작 위치(위도, 경도)
회전 각도
OpenStreetMap 도로 네트워크 데이터
Node(교차점)
Edge(도로 연결 정보)

데이터 출처
:OpenStreetMap
https://www.openstreetmap.org

## 주요 기능

### 1. 도형 기반 경로 생성

* 하트(Heart)
* 별(Star)
* 뼈(Bone)

사용자가 원하는 도형과 목표 거리를 입력하면 실제 도로망을 이용하여 도형과 유사한 러닝 경로를 생성합니다.

### 2. 경로 회전 기능

생성 전 도형의 회전 각도를 조절하여 다양한 방향의 경로를 생성할 수 있습니다.

### 3. 경로 시각화

OpenStreetMap 및 React-Leaflet 기반 지도를 이용하여 생성된 경로를 시각적으로 제공합니다.

### 4. GPX 내보내기

생성된 경로를 GPX 파일로 저장하여 카카오맵, Garmin, Strava 등 외부 서비스에서 사용할 수 있습니다.

### 5. 최근 경로 관리

LRU Cache 기반으로 최근 생성한 경로를 저장합니다.

* 최근 경로 조회
* 즐겨찾기 등록
* GPX 재다운로드
* 커뮤니티 탭

### 6. 러닝 분석

생성된 경로를 대상으로 다음 정보를 제공합니다.

#### 예상 완주 시간

목표 페이스(min/km)를 입력하여 예상 운동 시간을 계산합니다.

#### 예상 칼로리 소모량

성별, 나이, 키, 체중 정보를 이용하여 예상 칼로리 소모량을 계산합니다.

#### Zone2 권장 심박수

사용자의 나이를 입력받아 Zone2 권장 심박수 범위를 계산합니다.

---

## 시스템 구조

### Frontend

* React
* React Router
* React Leaflet
* OpenStreetMap

### Backend

* Node.js
* Express

---

## 프로젝트 구조

src/

├── pages/

│ ├── MainPage.jsx

│ ├── RouteGeneratorPage.jsx

│ ├── RouteHistoryPage.jsx

│ └── AnalysisPage.jsx

├── components/

│ ├── MapView.jsx

│ ├── ShapeSelector.jsx

│ ├── RouteComplexity.jsx

│ ├── ShapeAccuracy.jsx

│ ├── PaceEstimator.jsx

│ ├── CalorieEstimator.jsx

│ └── Zone2HeartRate.jsx

├── hooks/

│ ├── useRouteGenerator.js

│ ├── useRouteList.js

│ └── useCommunity.js

├── utils/

│ ├── graphUtils.js

│ ├── routeModule.js

│ ├── exportGPX.js

│ ├── shapeAccuracy.js

│ └── geometryUtils.js

---

## 실행 방법

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
node index.js
```

---

## 기대 효과

* 러닝 경로 생성 과정에 재미 요소 제공
* 반복적인 운동에 대한 동기 부여
* 사용자 맞춤형 러닝 경험 제공
* 실제 도로망 기반 경로 생성으로 실사용 가능

---

## 개발자

* 박유진
* 강서현
* 이창현
* 최영
