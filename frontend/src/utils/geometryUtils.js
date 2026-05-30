export function calculateDistance(lat1, lng1, lat2, lng2) {
  const dLat = lat1 - lat2
  const dLng = lng1 - lng2

  return Math.sqrt(dLat * dLat + dLng * dLng)
}

export function calculateAngle(a, b, c) {

  const abX = b[0] - a[0]
  const abY = b[1] - a[1]

  const bcX = c[0] - b[0]
  const bcY = c[1] - b[1]

  const dot =
    abX * bcX +
    abY * bcY

  const magnitudeAB =
    Math.sqrt(abX * abX + abY * abY)

  const magnitudeBC =
    Math.sqrt(bcX * bcX + bcY * bcY)

  const cosine =
    dot / (magnitudeAB * magnitudeBC)

  const angle =
    Math.acos(
      Math.max(-1, Math.min(1, cosine))
    )

  return (angle * 180) / Math.PI
}

export function rotatePoint(latOffset, lngOffset, angle) { //좌표 회전
    const rad = (angle * Math.PI) / 180

    const rotatedLat =
      latOffset * Math.cos(rad) - lngOffset * Math.sin(rad)

    const rotatedLng =
      latOffset * Math.sin(rad) + lngOffset * Math.cos(rad)

    return [rotatedLat, rotatedLng]
  }