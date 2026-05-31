routeComplexity.js

러닝 경로 난이도 분석
easy - medium - hard

평가 기준
* 총 회전 횟수
* sharp turn 개수
* 전체 거리
* 평균 segment 길이

모듈 7. routeComplexity.js ( frontend/src/utils/routeComplexity.js )

7-1) calculateRouteComplexity()

* 역할 :
    생성된 실제 러닝 경로(fullPathCoordinates)의 복잡도를 분석하여 러닝 난이도(Easy / Medium / Hard)를 계산한다.

러닝 경로는 단순 거리뿐 아니라 회전 횟수, 급격한 방향 전환, 경로 밀집도 등에 따라 체감 난이도가 달라질 수 있다.

따라서 사용자가 생성한 Shape 기반 러닝 경로의 실제 복잡도를 분석하여 보다 직관적인 러닝 정보를 제공하고자 하였다.

* 동작 원리 :

1. 생성된 실제 경로 좌표 배열(fullPathCoordinates)을 순차적으로 탐색한다.
2. 연속된 세 좌표(previous, current, next)를 이용하여 두 벡터의 방향 변화를 계산한다.
3. 벡터 내적(Dot Product)과 벡터 크기(Vector Magnitude)를 이용하여 회전 각도(angle)를 계산한다.
4. 일정 Threshold 이상의 급격한 회전(sharp turn)이 발생할 경우 난이도 점수를 증가시킨다.
5. 전체 회전 횟수, 평균 Segment 길이, 전체 경로 길이를 종합하여 Easy / Medium / Hard 난이도를 분류한다.

* 사용 자료구조 :

1. 배열(Array)

전체 경로 좌표 데이터를 순차적으로 저장하고 방향 변화를 계산하기 위해 사용하였다.

좌표 순서를 유지하면서 반복 탐색을 수행하기에 적합하였다.

1. 누적 카운터 변수(Counter Variables)

Sharp Turn 개수, Segment 수, 전체 거리 등을 누적 계산하기 위해 사용하였다.

복잡도 분석 과정에서 조건별 발생 횟수를 효율적으로 추적할 수 있기 때문에 선택하였다.

* 사용한 알고리즘 :

1. Vector Angle Calculation Algorithm

연속된 세 좌표 간 방향 벡터를 생성하고 벡터 내적(Dot Product)을 이용하여 회전 각도를 계산하였다.

이를 통해 급격한 방향 전환 여부를 정량적으로 분석할 수 있었다.

1. Threshold-based Classification Algorithm

회전 횟수와 평균 Segment 길이를 기준으로 Easy / Medium / Hard 난이도를 분류하였다.

복잡한 머신러닝 모델 없이도 구현이 단순하고 직관적인 난이도 분류가 가능했기 때문에 선택하였다.



input 데이터 (추가)

- 실제 생성 경로 좌표 배열 fullPathCoordinates [[lat,lng], ...]
  — 경로 난이도 분석 및 회전 각도 계산에 사용

- 경로 Segment 방향 벡터 데이터
  — 연속된 좌표 간 방향 변화 분석에 사용
