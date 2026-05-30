import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from 'react-leaflet'

import ClickHandler from './ClickHandler'

function MapView({
  startPoint,
  route,
  fullPathCoordinates,
  setStartPoint,
  fetchGraph,
  setRoadGraph,
  setGraph,
  loading,
  shape,
  distance,
}) {

  return (


<MapContainer
        center={[37.5445, 127.0373]}
        zoom={15}
        style={{
          height: '70vh',
          width: '100%',
          marginBottom: '15px',
          borderRadius: '15px',
          overflow: 'hidden',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler
          setStartPoint={setStartPoint}
          fetchGraph={fetchGraph}
          setRoadGraph={setRoadGraph}
          setGraph={setGraph}
          loading={loading}
          shape={shape}
          route={route}
        />

        {startPoint && <Marker position={startPoint} />}

        {shape && startPoint && distance && (
          <Polyline
            positions={route}
            pathOptions={{
              color: 'red',
              weight: 6,
              opacity: 0.5,
              dashArray: '8'
            }}
          />
        )}

        {fullPathCoordinates.length > 0 && (
          <Polyline
            positions={fullPathCoordinates}
            pathOptions={{
              color: 'blue',
              weight: 5,
            }}
          />
        )}
      </MapContainer>
        )
}

export default MapView