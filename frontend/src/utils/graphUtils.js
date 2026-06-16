import {
  calculateDistance,
  calculateAngle,
} from './geometryUtils'


export function buildGraph (elements) {
  const nodes = {}
  const adjacencyList = {}

  // 1. node 저장
  elements.forEach((element) => {
    if (element.type === 'node') {
      const nodeId = String(element.id)
      nodes[nodeId] = {
        lat: element.lat,
        lng: element.lon,
      }

      adjacencyList[nodeId] = []
    }
  })

  // 2. way 연결 정보 저장
  elements.forEach((element) => {
    if (element.type === 'way') {

      const wayNodes = element.nodes

      for (let i = 0; i < wayNodes.length - 1; i++) {
        const current = String(wayNodes[i])
        const next = String(wayNodes[i + 1])

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


export function findNearestNode(lat, lng, graph) {
  let nearestNodeId = null
  let minDistance = Infinity

  Object.entries(graph.nodes).forEach(([nodeId, nodeData]) => {

    const neighbors =
      graph.adjacencyList[nodeId] || []

    // 연결 거의 없는 노드 제외
    if (neighbors.length < 2) return

    const distance = calculateDistance(
      lat,
      lng,
      nodeData.lat,
      nodeData.lng
    )

    if (distance < minDistance && distance < 0.0006) {
      minDistance = distance
      nearestNodeId = nodeId
    }
  })

  return nearestNodeId
}


export function dijkstraShortestPath(startNode, endNode, graph) {

  const distances = {}
  const previous = {}
  const visited = new Set()

  // 초기화
  Object.keys(graph.nodes).forEach((nodeId) => {
    distances[nodeId] = Infinity
  })

  distances[startNode] = 0

  while (true) {

    let currentNode = null
    let shortestDistance = Infinity

    // 가장 가까운 미방문 노드 찾기
    Object.keys(distances).forEach((nodeId) => {

      if (
        !visited.has(nodeId) &&
        distances[nodeId] < shortestDistance
      ) {
        shortestDistance = distances[nodeId]
        currentNode = nodeId
      }
    })

    // 종료 조건
    if (currentNode === null) break

    if (currentNode === endNode) break

    visited.add(currentNode)

    const neighbors =
      graph.adjacencyList[currentNode] || []

    neighbors.forEach((neighbor) => {

      const newDistance =
        distances[currentNode] +
        neighbor.distance

      if (newDistance < distances[neighbor.node]) {

        distances[neighbor.node] = newDistance

        previous[neighbor.node] = currentNode
      }
    })
  }

  // 경로 복원
  const path = []

  let current = endNode

  while (current) {
    path.unshift(current)
    current = previous[current]
  }

  // 경로 없으면 null
  if (path[0] !== startNode) {
    return null
  }

  return path
}

export function removeConsecutiveDuplicates(path) {
  return path.filter((node, index) => {
    return index === 0 || node !== path[index - 1]
  })
}

export function removeBacktracks(path) {
  const cleaned = []

  for (let i = 0; i < path.length; i++) {

    const current = path[i]
    const prev = cleaned[cleaned.length - 1]
    const prevPrev = cleaned[cleaned.length - 2]

    // A → B → A 패턴 제거
    if (prevPrev === current) {
      cleaned.pop()
      continue
    }

    cleaned.push(current)
  }

  return cleaned
}

export function smoothSharpTurns(pathCoordinates) {

  if (pathCoordinates.length < 3) {
    return pathCoordinates
  }

  const smoothed = [pathCoordinates[0]]

  for (let i = 1; i < pathCoordinates.length - 1; i++) {

    const prev = pathCoordinates[i - 1]
    const current = pathCoordinates[i]
    const next = pathCoordinates[i + 1]

    const angle =
      calculateAngle(prev, current, next)

    // 너무 급한 회전 제거
    if (angle < 120) {
      smoothed.push(current)
    }
  }

  smoothed.push(
    pathCoordinates[pathCoordinates.length - 1]
  )

  return smoothed
}