import { routeOffsets } from '../data/routeOffsets'
import { rotatePoint } from '../utils/geometryUtils'
import {
  findNearestNode,
  dijkstraShortestPath,
  removeConsecutiveDuplicates,
  removeBacktracks,
  smoothSharpTurns,
} from '../utils/graphUtils'

/**
 * 1. 기본 도형 모델(정규화된 좌표계) 자체의 가상 총 길이를 계산합니다.
 */
function calculateShapeLength(points) {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0]
    const dy = points[i + 1][1] - points[i][1]
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return total
}

/**
 * 2. 선과 선 사이의 빈 공간에 일정 간격으로 가상 좌표들을 채워 넣어 경로를 촘촘하게 만듭니다. (선형 보간법 적용)
 * 맵 매칭 시 도로망 이탈이나 엉뚱한 노드로 스냅되는 현상을 방지하기 위해 정밀도를 높이는 필수 작업입니다.
 */
export function densifyRoute(route, steps = 5) {
  const result = []

  for (let i = 0; i < route.length - 1; i++) {
    const [lat1, lng1] = route[i]
    const [lat2, lng2] = route[i + 1]

    result.push([lat1, lng1])

    // 두 좌표 사이를 steps 등분하여 중간 좌표 생성 (t 비율에 따라 가중치 부여)
    for (let j = 1; j < steps; j++) {
      const t = j / steps
      result.push([
        lat1 + (lat2 - lat1) * t,
        lng1 + (lng2 - lng1) * t,
      ])
    }
  }
  result.push(route[route.length - 1]) // 마지막 좌표 추가
  return result
}

/**
 * 3. 사용자가 선택한 도형, 타겟 거리, 회전각, 시작점을 조합하여 지도 위에 띄울 가상 가이드 경로를 생성합니다.
 */
export function generateRoute({
  shape,
  startPoint,
  distance,
  rotation,
}) {
  if (!shape || !startPoint || !distance) return []

  // [스케일 계산] 기본 도형 원본의 가상 길이를 계산한 뒤, 위도 1도당 실제 거리(약 111km)를 곱해 km 단위로 환산
  const originalLength = calculateShapeLength(routeOffsets[shape])
  const shapeKm = originalLength * 111

  // 실제 도로에 매칭 시 다익스트라 우회 등으로 인해 경로가 길어지는 특성을 감안한 하드코딩 보정치(0.88)
  const correctionFactor = 0.88

  // 목표 거리(distance)와 현재 도형 크기의 비율을 구해 확장/축소 배율(scale) 결정
  const scale = (Number(distance) / shapeKm) * correctionFactor

  // [회전 및 크기 조절 변환] 모든 오프셋 좌표에 회전각과 스케일을 적용
  const transformedRoute = routeOffsets[shape].map(
    ([latOffset, lngOffset]) => {
      const [rotatedLat, rotatedLng] = rotatePoint(
        latOffset,
        lngOffset,
        rotation
      )
      return [
        rotatedLat * scale,
        rotatedLng * scale,
      ]
    }
  )

  // [위치 이동 변환] 사용자가 클릭한 시작점(startPoint)과 도형의 첫 번째 점 간의 차이를 구하여, 전체 도형을 해당 위치로 평행 이동
  const firstPoint = transformedRoute[0]
  const latShift = startPoint[0] - firstPoint[0]
  const lngShift = startPoint[1] - firstPoint[1]

  const route = transformedRoute.map(([lat, lng]) => [
    lat + latShift,
    lng + lngShift,
  ])

  // 러닝 코스는 순환(Loop) 형태여야 하므로 배열의 제일 끝에 첫 점을 한 번 더 붙여 닫힌 도형 생성
  route.push(route[0])

  console.log('requested distance:', distance)
  console.log('shape distance:', getPathLength(route))

  return route
}

/**
 * 4. 촘촘해진 가상 가이드 경로(denseRoute)를 실제 도로망 그래프(graph) 위의 노드로 스냅하고,
 * 그 사이를 다익스트라 최단 경로로 완벽하게 연결한 실제 러닝 코스 좌표 배열을 반환합니다.
 */
export function generateFullPathCoordinates({
  graph,
  denseRoute,
}) {
  console.time('path-generation')

  // [맵 매칭 - 스냅 단계] 촘촘한 가상 경로 상의 모든 위경도 좌표를 순회하며, 가장 가까운 도로망 실재 노드를 탐색
  const rawSnappedNodes =
    graph && denseRoute.length
      ? denseRoute.map(([lat, lng]) => findNearestNode(lat, lng, graph))
      : []

  const nullCount = rawSnappedNodes.filter(node => !node).length

  // 유효하지 않은(null) 노드를 걸러내고, 연속으로 동일하게 매칭된 중복 노드 ID를 1차로 압축
  const snappedNodes = rawSnappedNodes.filter(
    (node, index, arr) => node && node !== arr[index - 1]
  )

  console.log('snappedNodes length:', snappedNodes.length)

  let fullPath = []

  // [라우팅 단계] 매칭된 도로망 점들을 순서대로 잡고, 점과 점 사이의 끊어진 길을 다익스트라 알고리즘으로 추적 및 연결
  if (graph && snappedNodes.length >= 2) {
    for (let i = 0; i < snappedNodes.length - 1; i++) {
      const start = snappedNodes[i]
      const end = snappedNodes[i + 1]

      if (!start || !end) continue

      // 인접한 두 스냅 노드 사이의 최단 경로 세그먼트 생성
      const segment = dijkstraShortestPath(
        String(start),
        String(end),
        graph
      )

      if (segment) {
        fullPath.push(...segment) // 전체 단일 경로 배열에 이어 붙이기
      }
    }
  }

  // [후처리 단계] 그래프 탐색 중 발생한 단순 중복 및 유턴(왔다 갔다 하는 스파이크 현상) 노드 히스토리를 깔끔하게 필터링
  const cleanedPath = removeBacktracks(
    removeConsecutiveDuplicates(fullPath)
  )

  // [좌표 변환] 정리된 노드 ID 배열을 실제 지도에 그릴 수 있는 위경도 좌표([lat, lng]) 배열로 최종 복원
  const rawCoordinates =
    graph && cleanedPath.length
      ? cleanedPath.map((nodeId) => [
          graph.nodes[nodeId].lat,
          graph.nodes[nodeId].lng,
        ])
      : []

  // 인근 코너가 너무 뾰족하거나 유턴 형태로 도로를 횡단하는 구간을 완만하게 튜닝
  const finalPath = smoothSharpTurns(rawCoordinates)

  console.log('actual distance km:', getPathLength(finalPath))
  console.log('snap ratio:', snappedNodes.length / denseRoute.length)
  console.timeEnd('path-generation')

  return finalPath
}

/**
 * 5. 생성된 실제 위경도 좌표 배열을 활용하여 경로의 총 실거리(km)를 정확하게 측정합니다.
 * 하버사인 공식의 평면 단순화 버전이며, 위도에 따른 경도선 간격 수축 비율(Math.cos)이 반영되어 있습니다.
 */
function getPathLength(coords) {
  let total = 0

  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = coords[i][0]
    const lng1 = coords[i][1]
    const lat2 = coords[i + 1][0]
    const lng2 = coords[i + 1][1]

    // 위도 차이에 의한 거리 계산 (1도 ≒ 111km)
    const dLat = (lat2 - lat1) * 111

    // 경도 차이에 의한 거리 계산 (위도가 높아질수록 동서 간격이 좁아지므로 해당 위도의 cos 값을 곱해 보정)
    const dLng =
      (lng2 - lng1) *
      111 *
      Math.cos(lat1 * Math.PI / 180)

    // 피타고라스 정리를 통해 두 좌표 사이의 실제 물리적 거리 합산
    total += Math.sqrt(dLat * dLat + dLng * dLng)
  }

  return total
}