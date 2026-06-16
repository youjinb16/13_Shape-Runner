import { routeOffsets } from '../data/routeOffsets'

import { rotatePoint,} from '../utils/geometryUtils'

import {
  findNearestNode,
  dijkstraShortestPath,
  removeConsecutiveDuplicates,
  removeBacktracks,
  smoothSharpTurns,
} from '../utils/graphUtils'


function calculateShapeLength(points) {
  let total = 0

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0]
    const dy = points[i + 1][1] - points[i][1]

    total += Math.sqrt(dx * dx + dy * dy)
  }

  return total
}


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

    

    const originalLength =
      calculateShapeLength(routeOffsets[shape])

    const shapeKm =
      originalLength * 111

    const correctionFactor = 0.88

    const scale =
      (Number(distance) / shapeKm)
      * correctionFactor

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
    const route = transformedRoute.map(([lat, lng]) => [
      lat + latShift,
      lng + lngShift,
    ])

    // 시작점을 마지막에 한번 더 추가
    route.push(route[0])

    console.log(
      'requested distance:',
      distance
    )

    console.log(
      'shape distance:',
      getPathLength(route)
    )

    return route
  }

  export function generateFullPathCoordinates({
  graph,
  denseRoute,
}) {

  console.time('path-generation')

  const rawSnappedNodes =
    graph && denseRoute.length
      ? denseRoute.map(([lat, lng]) =>
          findNearestNode(lat, lng, graph)
        )
      : []


    const nullCount =
      rawSnappedNodes.filter(node => !node).length

    const snappedNodes =
      rawSnappedNodes.filter(
        (node, index, arr) =>
          node && node !== arr[index - 1]
      )

  console.log(
    'snappedNodes length:',
    snappedNodes.length
  )

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

  const finalPath =
    smoothSharpTurns(rawCoordinates)

  console.log(
  'actual distance km:',
  getPathLength(finalPath)
)

console.log(
  'snap ratio:',
  snappedNodes.length / denseRoute.length
)

  console.timeEnd('path-generation')
  return finalPath

  return smoothSharpTurns(rawCoordinates)

}

function getPathLength(coords) {
  let total = 0

  for (let i = 0; i < coords.length - 1; i++) {

    const lat1 = coords[i][0]
    const lng1 = coords[i][1]

    const lat2 = coords[i + 1][0]
    const lng2 = coords[i + 1][1]

    const dLat = (lat2 - lat1) * 111

    const dLng =
      (lng2 - lng1) *
      111 *
      Math.cos(lat1 * Math.PI / 180)

    total += Math.sqrt(
      dLat * dLat +
      dLng * dLng
    )
  }

  return total
}

