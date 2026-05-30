import { routeOffsets } from '../data/routeOffsets'

import { rotatePoint,} from '../utils/geometryUtils'

import {
  findNearestNode,
  dijkstraShortestPath,
  removeConsecutiveDuplicates,
  removeBacktracks,
  smoothSharpTurns,
} from '../utils/graphUtils'

export function densifyRoute(route, steps = 5) {
  const result = []

  for (let i = 0; i < route.length - 1; i++) {
    const [lat1, lng1] = route[i]
    const [lat2, lng2] = route[i + 1]

    result.push([lat1, lng1])

    for (let j = 1; j < steps; j++) {
      const t = j / steps

      result.push([
        lat1 + (lat2 - lat1) * t,
        lng1 + (lng2 - lng1) * t,
      ])
    }
  }

  result.push(route[route.length - 1])

  return result
}

export function generateRoute({
  shape,
  startPoint,
  distance,
  rotation,
}) {
    if (!shape || !startPoint || !distance) return []

    const scale = Number(distance) / 2

    // 회전 + 스케일 적용
    const transformedRoute = routeOffsets[shape].map(
      ([latOffset, lngOffset]) => {

        const [rotatedLat, rotatedLng] =
          rotatePoint(
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

    // shape의 첫 점
    const firstPoint = transformedRoute[0]

    // 클릭 위치와 첫 점 차이 계산
    const latShift =
      startPoint[0] - firstPoint[0]

    const lngShift =
      startPoint[1] - firstPoint[1]

    // 전체 이동
    return transformedRoute.map(([lat, lng]) => [
      lat + latShift,
      lng + lngShift,
    ])
  }

  export function generateFullPathCoordinates({
  graph,
  denseRoute,
}) {

  const snappedNodes =
    graph && denseRoute.length
      ? denseRoute.map(([lat, lng]) =>
          findNearestNode(lat, lng, graph)
        )
        .filter((node, index, arr) =>
          node && node !== arr[index - 1]
        )
      : []

  let fullPath = []

  if (graph && snappedNodes.length >= 2) {

    for (let i = 0; i < snappedNodes.length - 1; i++) {

      const start = snappedNodes[i]
      const end = snappedNodes[i + 1]

      if (!start || !end) continue

      const segment = dijkstraShortestPath(
        String(start),
        String(end),
        graph
      )

      if (segment) {
        fullPath.push(...segment)
      }
    }
  }

  const cleanedPath =
    removeBacktracks(
      removeConsecutiveDuplicates(fullPath)
    )

  const rawCoordinates =
    graph && cleanedPath.length
      ? cleanedPath.map((nodeId) => [
          graph.nodes[nodeId].lat,
          graph.nodes[nodeId].lng,
        ])
      : []

  return smoothSharpTurns(rawCoordinates)
}