export function calculateShapeAccuracy(
  originalRoute,
  actualRoute
) {
  if (
    !originalRoute ||
    !actualRoute ||
    originalRoute.length === 0 ||
    actualRoute.length === 0
  ) {
    return 0
  }

  let totalDistance = 0

  for (const point of actualRoute) {

    let minDistance = Infinity

    for (const target of originalRoute) {

      const dist = Math.sqrt(
        (point[0] - target[0]) ** 2 +
        (point[1] - target[1]) ** 2
      )

      minDistance =
        Math.min(
          minDistance,
          dist
        )
    }

    totalDistance += minDistance
  }

  const avgDistance =
    totalDistance /
    actualRoute.length

  const score =
  Math.max(
    0,
    100 - avgDistance * 150000
  )

  return score.toFixed(1)
}