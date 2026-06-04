// [이창현 수정] MapView.jsx  ( frontend/src/components/MapView.jsx )
// 0531 창현 - 도로 데이터 로딩 중 오버레이 안내 추가
// 0531 창현 - 시작 지점 미설정 시 클릭 안내 문구 추가
// 0531 창현 - fetchGraph 관련 props 제거 (App.jsx 경로 생성 버튼으로 분리)
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from 'react-leaflet'

import ClickHandler from './ClickHandler'

/**
 * [이창현 수정] 지도 컴포넌트
 *
 * [변경 사항]
 * 1. 도로 데이터 로딩 중 오버레이 안내 추가
 *    기존: 로딩 중인지 사용자가 알 수 없음
 *    개선: loading 상태일 때 "도로 데이터 불러오는 중..." 반투명 오버레이 표시
 *
 * 2. 시작 지점 미설정 시 클릭 안내 문구 추가
 *    기존: 지도를 클릭해야 한다는 안내 없음
 *    개선: 시작점 미설정 시 지도 상단에 클릭 안내 문구 표시
 *
 * 3. fetchGraph 관련 props 제거
 *    도로 데이터 로드를 App.jsx의 "경로 생성하기" 버튼으로 분리하면서 불필요해진 props 제거
 *
 * @param {Array}    startPoint           - 시작점 좌표 [lat, lng]
 * @param {Array}    route                - 예시 도형 좌표 배열 (빨간 점선으로 표시)
 * @param {Array}    fullPathCoordinates  - 실제 경로 좌표 배열 (파란 선으로 표시)
 * @param {Function} setStartPoint        - 시작점 setter
 * @param {boolean}  loading              - 도로 데이터 로딩 중 여부
 * @param {string}   shape                - 선택된 도형 종류
 * @param {string}   distance             - 입력된 거리
 */
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

        {/* 0531 창현 - ClickHandler: fetchGraph 제거, 시작점 설정만 수행 */}
        <ClickHandler
          setStartPoint={setStartPoint}
          loading={loading}
        />

        {startPoint && <Marker position={startPoint} />}

        {/* 예시 도형 (빨간 점선) — 지도 클릭 즉시 표시 */}
        {shape && startPoint && distance && (
          <Polyline
            positions={route}
            pathOptions={{ color: 'red', weight: 6, opacity: 0.5, dashArray: '8' }}
          />
        )}

        {/* 실제 경로 (파란 선) — 경로 생성하기 버튼 클릭 후 표시 */}
        {fullPathCoordinates.length > 0 && (
          <Polyline
            positions={fullPathCoordinates}
            pathOptions={{ color: 'blue', weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default MapView
