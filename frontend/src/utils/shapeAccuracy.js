// 두 좌표(위경도) 간의 평면 유클리드 거리를 계산하는 함수
const getDistance = (coord1, coord2) => {
  const dx = coord1[0] - coord2[0];
  const dy = coord1[1] - coord2[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// [최영] 동적 계획법(DP) 기반 DTW 알고리즘 구현
export const calculateDTWDistance = (route, fullPath) => {
  const N = route.length;
  const M = fullPath.length;

  // 2차원 비용 행렬 (2D Cost Matrix) 자료구조 사용
  const dtwMatrix = Array(N + 1)
    .fill(null)
    .map(() => Array(M + 1).fill(Infinity));

  dtwMatrix[0][0] = 0;

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= M; j++) {
      const cost = getDistance(route[i - 1], fullPath[j - 1]);
      dtwMatrix[i][j] = cost + Math.min(
        dtwMatrix[i - 1][j],     // Insertion
        dtwMatrix[i][j - 1],     // Deletion
        dtwMatrix[i - 1][j - 1]  // Match
      );
    }
  }
  return dtwMatrix[N][M];
};

// 메인 유사도 측정 함수 (route: 원본 도형, fullPathCoordinates: 실제 도로 경로)
export function calculateShapeAccuracy(route, fullPathCoordinates) {

  if (!route || !fullPathCoordinates || route.length === 0 || fullPathCoordinates.length === 0) {
    return { accuracyScore: 0, dtwScore: 0, finalCombinedScore: 0 };
  }

  // 알고리즘 1: 최근접 거리 기반 Shape Similarity (배열 순차 탐색 & 최소 거리 추적)
  let totalDistance = 0;
  for (const point of fullPathCoordinates) {
    let minDistance = Infinity;
    for (const target of route) {
      const dist = getDistance(point, target);
      minDistance = Math.min(minDistance, dist);
    }
    totalDistance += minDistance;
  }
  const avgDistance = totalDistance / fullPathCoordinates.length;

  // 기존 프로젝트의 거리 스케일 가중치(150000) 유지하여 점수화
  const accuracyScore = //점수 오류 수정 - 박유진
    Math.max(
      0,
      Math.round(
        100 * Math.exp(-avgDistance * 800)
      )
    )

  // 알고리즘 2: 동적 계획법 기반 DTW 궤적 흐름 검증
  const totalDTWCost = calculateDTWDistance(route, fullPathCoordinates);
  const averageDTWCost = totalDTWCost / (route.length + fullPathCoordinates.length);

  
  // DTW 위경도 스케일에 맞춘 민감도 가중치 보정
  const dtwScore = //점수 오류 수정 - 박유진
    Math.max(
      0,
      Math.round(
        100 * Math.exp(-averageDTWCost * 1000)
      )
    )
  // 최종 결합 점수 (공간 50% + 패턴 50%)
  const finalCombinedScore = Math.round((accuracyScore + dtwScore) / 2);

  return {
    accuracyScore,
    dtwScore,
    finalCombinedScore
  };
}
