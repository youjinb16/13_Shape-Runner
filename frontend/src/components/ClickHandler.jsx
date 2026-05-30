import { useMapEvents } from 'react-leaflet'
import { buildGraph } from '../utils/graphUtils'

function ClickHandler({
  setStartPoint,
  fetchGraph,
  setRoadGraph,
  setGraph,
  loading,
  shape,
  route,
}) {
  useMapEvents({
    async click(e) {
      if (loading) return

      const lat = e.latlng.lat
      const lng = e.latlng.lng

      setStartPoint([lat, lng])

  try {
    const graphData = await fetchGraph(lat, lng)
    if (!graphData) return
    setRoadGraph(graphData)

    const builtGraph = buildGraph(graphData.elements)
    setGraph(builtGraph)

    console.log(
      'Graph loaded:',
      Object.keys(builtGraph.nodes).length,
      'nodes'
    )

  } catch (e) {
    console.error(e)
  }
},
  })

  return null
}

export default ClickHandler