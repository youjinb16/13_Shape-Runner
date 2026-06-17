// 202334670 박유진


/**
 * 1. 두 평면 좌표(위경도) 사이의 직선 거리(유클리드 거리)를 계산합니다.
 * (※ 아주 가까운 거리 피팅용으로, 평면 피타고라스 정리를 사용함)
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const dLat = lat1 - lat2 // 위도 차이
  const dLng = lng1 - lng2 // 경도 차이

  // 피타고라스 정리: √(a² + b²)
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

/**
 * 2. 세 점(a -> b -> c)이 이루는 꺾임각(외각/진행 방향의 회전 각도)을 계산합니다.
 * 직선(180도)을 기준으로 경로가 얼마나 급격하게 꺾이는지 판정할 때 사용됩니다.
 */
export function calculateAngle(a, b, c) {
  // b점을 기준으로 벡터 AB 계산 (a점에서 b점으로 향하는 방향 벡터)
  const abX = b[0] - a[0]
  const abY = b[1] - a[1]

  // c점을 기준으로 벡터 BC 계산 (b점에서 c점으로 향하는 방향 벡터)
  const bcX = c[0] - b[0]
  const bcY = c[1] - b[1]

  // 두 벡터의 내적(Dot Product) 계산: (x1 * x2) + (y1 * y2)
  const dot = abX * bcX + abY * bcY

  // 벡터 AB와 벡터 BC의 크기(Magnitude, 길이) 계산
  const magnitudeAB = Math.sqrt(abX * abX + abY * abY)
  const magnitudeBC = Math.sqrt(bcX * bcX + bcY * bcY)

  // 코사인 법칙을 활용한 cos(θ) 값 유도
  const cosine = dot / (magnitudeAB * magnitudeBC)

  // 부동 소수점 오차로 인해 코사인 값이 -1과 1을 벗어나는 것을 방지 (안전 장치)
  // 아크코사인(acos)을 통해 라디안 형태의 각도(θ)를 구함
  const angle = Math.acos(
    Math.max(-1, Math.min(1, cosine))
  )

  // 라디안 단위를 도(Degree, 0~180도) 단위로 변환하여 반환
  return (angle * 180) / Math.PI
}

/**
 * 3. 기준점으로부터의 오프셋 좌표(latOffset, lngOffset)를 지정된 각도만큼 회전 변환합니다.
 * 사용자가 생성할 도형을 회전 컨트롤러로 돌릴 때, 도형의 좌표들을 회전 정렬하는 데 사용됩니다.
 */
export function rotatePoint(latOffset, lngOffset, angle) {
  // 각도(Degree)를 라디안(Radian) 단위로 변환
  const rad = (angle * Math.PI) / 180

  // 2D 회전 변환 행렬(Rotation Matrix) 공식 적용
  // X' = X * cos(θ) - Y * sin(θ)
  const rotatedLat =
    latOffset * Math.cos(rad) - lngOffset * Math.sin(rad)

  // Y' = X * sin(θ) + Y * cos(θ)
  const rotatedLng =
    latOffset * Math.sin(rad) + lngOffset * Math.cos(rad)

  // 회전된 새로운 오프셋 좌표 반환
  return [rotatedLat, rotatedLng]
}