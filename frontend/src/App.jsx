import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { fetchGraphData } from './api/graphApi';
import bgImage from './assets/Bacjground_img.jpg';
import DistanceInput from './components/DistanceInput';
import MapView from './components/MapView';
import RotateControls from './components/RotateControls';
import ShapeSelector from './components/ShapeSelector';
import StatusPanel from './components/StatusPanel';
import {
  densifyRoute,
  generateFullPathCoordinates,
  generateRoute,
} from './hooks/useRouteGenerator';
import {
  buttonStyle,
  shapeColors,
} from './styles/buttonStyles';
import { exportGPXFile } from './utils/exportGPX';


function App() {
  const [shape, setShape] = useState('')
  const [startPoint, setStartPoint] = useState(null)
  const [distance, setDistance] = useState('')
  const [roadGraph, setRoadGraph] = useState(null)
  const [loading, setLoading] = useState(false)
  const [roadLoaded, setRoadLoaded] = useState(false)
  const [error, setError] = useState('')
  const [rotation, setRotation] = useState(0)

  const [leftFlash, setLeftFlash] = useState(false)
  const [rightFlash, setRightFlash] = useState(false)

  const [gpxFlash, setGpxFlash] = useState(false)

  const [showToast, setShowToast] = useState(false)

  const [graph, setGraph] = useState(null)



const getShapeButtonStyle = (currentShape) => {

  const isSelected = shape === currentShape

  return {
    ...buttonStyle,

    backgroundColor: isSelected
      ? shapeColors[currentShape]
      : 'white',

    color: isSelected
      ? 'white'
      : '#444',

    boxShadow: isSelected
      ? '0 4px 12px rgba(0,0,0,0.15)'
      : 'none',

    transform: isSelected
      ? 'translateY(-1px)'
      : 'translateY(0)',
  }
}


const handleRotateLeft = () => {
  setRotation((rotation - 90 + 360) % 360)

  setLeftFlash(true)
  setTimeout(() => setLeftFlash(false), 300)
  }

const handleRotateRight = () => {
  setRotation((rotation + 90) % 360)

  setRightFlash(true)
  setTimeout(() => setRightFlash(false), 300)
}

  

  const fetchGraph = async (lat, lng) => {

    setLoading(true)
    setRoadLoaded(false)
    setError('')

    try {

      const data = await fetchGraphData(lat, lng)

      setRoadLoaded(true)

      return data

    } catch (err) {

      console.error(err)

      setError('Failed to load road data')

      return null

    } finally {

      setLoading(false)
    }
  }
 
  const exportGPX = () => {

    if (!fullPathCoordinates.length) return

    setGpxFlash(true)

    setTimeout(() => setGpxFlash(false), 600)

    exportGPXFile(fullPathCoordinates)

    setShowToast(true)

    setTimeout(() => setShowToast(false), 1500)
  }

  const route = generateRoute({
    shape,
    startPoint,
    distance,
    rotation,
  })

  const denseRoute = densifyRoute(route, 20)

  const fullPathCoordinates =
  generateFullPathCoordinates({
    graph,
    denseRoute,
  })


// 디자인

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        
        minHeight: '100vh',
        width: '100%',            // 가로를 화면에 꽉 채웁니다.

        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',      // 이미지가 깨지거나 비율이 망가지지 않게 화면을 '커버'하며 채웁니다.
        backgroundPosition: 'center',  // 화면 정중앙을 기준으로 이미지를 배치합니다.
        backgroundRepeat: 'no-repeat', // 이미지가 작아도 바둑판처럼 반복되지 않게 합니다.
        backgroundAttachment: 'fixed',

        overflow: 'auto',
      }}
    >

      <div
        style={{
          padding: '24px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(4px)',
          borderRadius: '20px',
          margin: '25px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ margin: 0, color: 'black' }}>🗺️ Shape Runner ✨</h1>
        <p style={{ marginTop: '20px', color: '#666', marginBottom: '20px'}}>
          모양 기반 러닝/산책 루트 생성
        </p>


        <h3
        style={{
          marginTop: '20px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#444',
        }}
        >
          1. 생성할 루트 모양을 선택하세요</h3>

       <ShapeSelector
          shape={shape}
          setShape={setShape}
          getShapeButtonStyle={getShapeButtonStyle}
        />

        <DistanceInput
          distance={distance}
          setDistance={setDistance}
        />

      <h3
        style={{
          marginTop: '20px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#444',
        }}
        >
          3. 지도 위에서 시작 지점을 클릭하세요</h3>
      
  <MapView
      startPoint={startPoint}
      route={route}
      fullPathCoordinates={fullPathCoordinates}
      setStartPoint={setStartPoint}
      fetchGraph={fetchGraph}
      setRoadGraph={setRoadGraph}
      setGraph={setGraph}
      loading={loading}
      shape={shape}
      distance={distance}
  />   

<StatusPanel
  distance={distance}
  shape={shape}
  loading={loading}
  error={error}
  roadLoaded={roadLoaded}
  startPoint={startPoint}
  roadGraph={roadGraph}
  graph={graph}
/>

<RotateControls
  rotation={rotation}
  handleRotateLeft={handleRotateLeft}
  handleRotateRight={handleRotateRight}
  leftFlash={leftFlash}
  rightFlash={rightFlash}
/>

        <p style={{ marginBottom: '5px' }}>
          Rotation:{' '}
          <span style={{ color: rotation === 0 ? '#999' : '#1976d2' }}>
            {rotation}°
          </span>
        </p>

        <h3
        style={{
          marginTop: '20px',
          fontSize: '14px',
          color: '#444',
        }}
        >
          5. GPX 파일로 저장하세요</h3>

        <button
          onClick={exportGPX}
          disabled={!fullPathCoordinates.length}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: !fullPathCoordinates.length
              ? '#ffffff'
              : gpxFlash
              ? '#f8801f'
              : '#189b81',
              color: !fullPathCoordinates.length 
                ? '#aeacac' // 비활성화일 때: 검정 글씨
                : '#ffffff', // 활성화일 때: 흰 글씨
            cursor: route.length ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease, color 0.2s ease',
          }}
        >
          Export GPX
        </button>

<h3
        style={{
          marginTop: '20px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#444',
        }}
        >
          ✨<br></br>
          생성된 gpx 파일을 카카오맵 등에 불러와<br></br>
          즐겁고 신선한 러닝 경험을 즐기세요!</h3>
      </div>

      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '16px 28px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 9999,
            transition: 'opacity 0.5s ease',
          }}
        >
          ✨ 저장 완료!
        </div>
      )}
    </div>
  )

}

export default App