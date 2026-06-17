//202334670 박유진

import {
  calculateDistance,
  calculateAngle,
} from './geometryUtils'

/**
 * 1. OpenStreetMap(OSM) 요소 배열을 기반으로 인접 리스트(Adjacency List) 형태의 그래프를 생성합니다.
 */
export function buildGraph (elements) {
  const nodes = {}          // 노드 ID를 키로 하여 위경도 좌표(lat, lng)를 저장하는 객체
  const adjacencyList = {}  // 각 노드에 연결된 이웃 노드들과의 거리 정보를 담는 인접 리스트

  // [단계 1] 지도 데이터에서 노드(점) 정보를 파싱하여 저장하고, 인접 리스트 공간 확보
  elements.forEach((element) => {
    if (element.type === 'node') {
      const nodeId = String(element.id)
      nodes[nodeId] = {
        lat: element.lat,
        lng: element.lon,
      }
      // 해당 노드의 이웃 노드 목록을 담을 빈 배열 생성
      adjacencyList[nodeId] = []
    }
  })

  // [단계 2] 웨이(길) 데이터를 순회하며 인접한 노드들을 양방향으로 연결 (무방향 그래프 생성)
  elements.forEach((element) => {
    if (element.type === 'way') {
      const wayNodes = element.nodes // 하나의 길을 구성하는 연속된 노드 ID 배열

      // 연속된 두 노드(current, next)를 찾아서 간선(Edge)과 가중치(거리)를 계산하여 연결
      for (let i = 0; i < wayNodes.length - 1; i++) {
        const current = String(wayNodes[i])
        const next = String(wayNodes[i + 1])

        // 2-1. current 노드에서 next 노드로 가는 경로 및 거리 추가
        if (adjacencyList[current]) {
          const distance = calculateDistance(
            nodes[current].lat,
            nodes[current].lng,
            nodes[next].lat,
            nodes[next].lng
          )

          adjacencyList[current].push({
            node: next,
            distance,
          })
        }

        // 2-2. 반대 방향(next -> current) 경로 및 거리 추가 (양방향 도로 가정)
        if (adjacencyList[next]) {
          const distance = calculateDistance(
            nodes[current].lat,
            nodes[current].lng,
            nodes[next].lat,
            nodes[next].lng
          )

          adjacencyList[next].push({
            node: current,
            distance,
          })
        }
      }
    }
  })

  return {
    nodes,
    adjacencyList,
  }
}

/**
 * 2. 사용자가 지도상에서 터치하거나 지정한 임의의 위치(lat, lng)에서 
 * 가장 가까운 그래프 상의 유효한 노드(인접한 실제 도로망의 교차점)를 검색합니다.
 */
export function findNearestNode(lat, lng, graph) {
  let nearestNodeId = null
  let minDistance = Infinity

  Object.entries(graph.nodes).forEach(([nodeId, nodeData]) => {
    const neighbors = graph.adjacencyList[nodeId] || []

    // 막다른 길이나 고립된 노드(연결된 이웃이 2개 미만)는 매칭 대상에서 제외 (러닝 경로 생성 품질 향상)
    if (neighbors.length < 2) return

    // 기준 좌표와 그래프 상 노드 간의 실제 거리 계산
    const distance = calculateDistance(
      lat,
      lng,
      nodeData.lat,
      nodeData.lng
    )

    // 반경 60m 이내(약 0.0006도)에 있는 가장 가까운 노드를 매칭
    if (distance < minDistance && distance < 0.0006) {
      minDistance = distance
      nearestNodeId = nodeId
    }
  })

  return nearestNodeId
}

/**
 * 3. 다익스트라(Dijkstra) 알고리즘을 사용해 시작 노드와 도착 노드 간의 최단 경로를 탐색합니다.
 */
export function dijkstraShortestPath(
  startNode,
  endNode,
  graph
) {
  const distances = {}   // 시작점으로부터 각 노드까지의 최소 거리를 기록하는 객체
  const previous = {}    // 최단 경로 역추적을 위해 직전 방문 노드를 기록하는 객체
  const visited = new Set() // 방문 완료된 노드를 관리하는 셋(Set)

  // 모든 노드의 최소 거리를 무한대(Infinity)로 초기화
  Object.keys(graph.nodes).forEach((nodeId) => {
    distances[nodeId] = Infinity
  })

  // 출발지의 거리는 0으로 설정
  distances[startNode] = 0

  // 우선순위 큐(배열로 구현)를 생성하고 시작점 삽입
  const pq = [
    {
      node: startNode,
      distance: 0,
    },
  ]

  while (pq.length > 0) {
    // [우선순위 정렬] 누적 거리가 가장 짧은 노드가 앞으로 오도록 정렬 (가장 최적화가 필요한 부분)
    pq.sort((a, b) => a.distance - b.distance)

    // 거리가 가장 짧은 노드를 큐에서 꺼냄
    const {
      node: currentNode,
      distance: currentDistance,
    } = pq.shift()

    // 이미 방문하여 최단 거리가 확정된 노드라면 스킵
    if (visited.has(currentNode)) continue
    visited.add(currentNode)

    // 목적지에 도착했다면 루프 탈출
    if (currentNode === endNode) break

    const neighbors = graph.adjacencyList[currentNode] || []

    // 현재 노드와 인접한 이웃 노드들의 거리를 갱신 (Relaxation)
    neighbors.forEach((neighbor) => {
      const newDistance = currentDistance + neighbor.distance

      // 기존 기록된 거리보다 더 짧은 경로를 발견한 경우 정보 업데이트
      if (newDistance < distances[neighbor.node]) {
        distances[neighbor.node] = newDistance
        previous[neighbor.node] = currentNode // 이전 노드 기록 (경로 추적용)

        pq.push({
          node: neighbor.node,
          distance: newDistance,
        })
      }
    })
  }

  // [경로 역추적 및 복원] previous 배열을 따라 도착점부터 시작점까지 거꾸로 추적하여 배열 생성
  const path = []
  let current = endNode

  while (current) {
    path.unshift(current) // 배열의 앞쪽에 삽입하여 올바른 진행 방향 순서로 복원
    current = previous[current]
  }

  // 만약 시작점까지 연결이 끊겨 있다면 올바른 경로가 없으므로 null 반환
  if (path[0] !== startNode) {
    return null
  }

  return path
}

/**
 * 4. 경로 배열에서 연속으로 중복되어 들어간 동일한 노드 ID를 제거합니다. (예: [A, B, B, C] -> [A, B, C])
 */
export function removeConsecutiveDuplicates(path) {
  return path.filter((node, index) => {
    return index === 0 || node !== path[index - 1]
  })
}

/**
 * 5. 경로 생성 중 왔던 길을 바로 되돌아가는 스파이크(Backtrack) 현상을 제거합니다. (예: A -> B -> A 패턴을 A로 최적화)
 */
export function removeBacktracks(path) {
  const cleaned = []

  for (let i = 0; i < path.length; i++) {
    const current = path[i]
    const prev = cleaned[cleaned.length - 1]
    const prevPrev = cleaned[cleaned.length - 2]

    // 직전전(prevPrev) 노드가 현재(current) 노드와 같다면 유턴한 것이므로, 직전(prev)에 쌓인 막다른 길을 지우고 진행
    if (prevPrev === current) {
      cleaned.pop()
      continue
    }

    cleaned.push(current)
  }

  return cleaned
}

/**
 * 6. 경로의 각 좌표 꺾임각을 계산하여 너무 급격하게 꺾이는 각도(180도 유턴성 회전 등)를 완만하게 다듬어줍니다.
 */
export function smoothSharpTurns(pathCoordinates) {
  if (pathCoordinates.length < 3) {
    return pathCoordinates
  }

  const smoothed = [pathCoordinates[0]] // 시작점은 무조건 포함

  for (let i = 1; i < pathCoordinates.length - 1; i++) {
    const prev = pathCoordinates[i - 1]
    const current = pathCoordinates[i]
    const next = pathCoordinates[i + 1]

    // 세 지점 사이의 내각(Angle)을 기하학적으로 계산
    const angle = calculateAngle(prev, current, next)

    // 각도가 120도 미만(급격하게 꺾이는 예리한 턴)인 경우만 유지하고, 너무 완만하거나 직선에 가까우면 경로 최적화를 위해 일부 생략 검토 가능
    // (현재 로직은 각도가 120도 미만일 때만 smoothed에 명시적으로 추가하고 있음)
    if (angle < 120) {
      smoothed.push(current)
    }
  }

  smoothed.push(
    pathCoordinates[pathCoordinates.length - 1] // 마지막 점 무조건 포함
  )

  return smoothed
}