function StatusPanel({
  distance,
  shape,
  loading,
  error,
  roadLoaded,
  startPoint,
  roadGraph,
  graph,
}) {

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          marginBottom: '5px',
          textAlign: 'left',
        }}
      >

        <p>
          Distance:{' '}
          <span style={{ color: distance ? '#2e7d32' : '#999' }}>
            {distance || 'None'} km
          </span>
        </p>

        <p>
          Selected Shape:{' '}
          <span style={{ color: shape ? '#2e7d32' : '#999' }}>
            {shape || 'None'}
          </span>
        </p>

        <p>
          Road Status:{' '}
          <span
            style={{
              color: loading
                ? '#f57c00'
                : error
                ? '#d32f2f'
                : roadLoaded
                ? '#2e7d32'
                : '#999',
            }}
          >
            {loading
              ? 'Loading road data...'
              : error
              ? error
              : roadLoaded
              ? 'Road data loaded'
              : 'None'}
          </span>
        </p>

        <p>
          Start Point:{' '}
          <span style={{ color: startPoint ? '#2e7d32' : '#999' }}>
            {startPoint
              ? `${startPoint[0].toFixed(4)}, ${startPoint[1].toFixed(4)}`
              : 'None'}
          </span>
        </p>

        <p>
          Road Graph:{' '}
          <span style={{ color: roadGraph ? '#2e7d32' : '#999' }}>
            {roadGraph
              ? `${roadGraph.elements.length} elements loaded`
              : 'None'}
          </span>
        </p>

        <p>
          Graph Nodes:{' '}
          <span style={{ color: graph ? '#2e7d32' : '#999' }}>
            {graph
              ? Object.keys(graph.nodes).length
              : 'None'}
          </span>
        </p>

      </div>
    </div>
  )
}

export default StatusPanel