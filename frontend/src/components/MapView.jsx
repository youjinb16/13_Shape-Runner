// 0531 창현 - 경로 매핑 중 안내 표시 추가, 지도 클릭 안내 문구 추가
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
  loading,
  shape,
  distance,
}) {

  return (
    <div style={{ position: 'relative' }}>

      {/* 0531 창현 - 도로 데이터 불러오는 중 오버레이 안내 */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            padding: '12px 22px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          🗺️ 도로 데이터 불러오는 중...
        </div>
      )}

      {/* 0531 창현 - 시작 지점 미설정 시 클릭 안내 문구 표시 */}
      {!loading && !startPoint && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.88)',
            color: '#444',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          📍 지도를 클릭해서 시작 지점을 설정하세요
        </div>
      )}

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

        {/* 0531 창현 - ClickHandler에서 fetchGraph 제거, 시작점 설정만 수행 */}
        <ClickHandler
          setStartPoint={setStartPoint}
          loading={loading}
        />

        {startPoint && <Marker position={startPoint} />}

        {/* 예시 도형 (빨간 점선) - 클릭 즉시 표시 */}
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

        {/* 실제 경로 (파란 선) - 경로 생성하기 버튼 클릭 후 표시 */}
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
    </div>
  )
}

export default MapView
