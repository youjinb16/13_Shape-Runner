export function exportGPXFile(fullPathCoordinates) {

  if (!fullPathCoordinates.length) return

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Shape Runner">
  <trk>
    <name>Shape Runner Route</name>
    <trkseg>
      ${fullPathCoordinates
        .map(
          ([lat, lng]) =>
            `<trkpt lat="${lat}" lon="${lng}" />`
        )
        .join('\n')}
    </trkseg>
  </trk>
</gpx>`

  const blob = new Blob([gpxContent], {
    type: 'application/gpx+xml',
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url
  link.download = 'shape-runner-route.gpx'

  link.click()

  URL.revokeObjectURL(url)
}