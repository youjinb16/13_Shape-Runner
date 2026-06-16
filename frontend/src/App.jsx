import 'leaflet/dist/leaflet.css';
import { useState, useMemo } from 'react';
import { fetchGraphData } from './api/graphApi';
import bgImage from './assets/Bacjground_img.jpg';
import DistanceInput from './components/DistanceInput';
import MapView from './components/MapView';
import RotateControls from './components/RotateControls';
import ShapeSelector from './components/ShapeSelector';
import StatusPanel from './components/StatusPanel';
import ShapeAccuracy from './components/ShapeAccuracy'
import RouteComplexity from './components/RouteComplexity';
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
import { buildGraph } from './utils/graphUtils';
import RouteListPage from './components/RouteListPage';
import { exportGPXFile as exportGPXWithLRU } from './utils/routeModule';


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

  // 0531 창현 - GPX 내보내기 확인 알림 state 추가
  const [showGpxConfirm, setShowGpxConfirm] = useState(false)

  // 0531 창현 - 경로 목록 페이지 표시 state (recent: 최근 생성 경로, fav: 즐겨찾는 경로, null: 메인)
  const [showList, setShowList] = useState(null)


  const getShapeButtonStyle = (currentShape) => {
    const isSelected = shape === currentShape
    return {
      ...buttonStyle,
      backgroundColor: isSelected ? shapeColors[currentShape] : 'white',
      color: isSelected ? 'white' : '#444',
      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
      transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
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

  // 0531 창현 - 경로 생성 버튼 분리: 버튼 클릭 시에만 도로 데이터 불러오고 경로 생성
  const handleGenerateRoute = async () => {
    if (!startPoint || !shape || !distance) return

    setLoading(true)
    setRoadLoaded(false)
    setError('')
    setGraph(null)
    setRoadGraph(null)

    try {
      const data = await fetchGraphData(startPoint[0], startPoint[1])
      if (!data) return

      setRoadGraph(data)
      setRoadLoaded(true)

      const builtGraph = buildGraph(data.elements)
      setGraph(builtGraph)

      console.log('Graph loaded:', Object.keys(builtGraph.nodes).length, 'nodes')
    } catch (err) {
      console.error(err)
      setError('Failed to load road data')
    } finally {
      setLoading(false)
    }
  }

  // 0531 창현 - GPX 내보내기: 버튼 클릭 시 확인 알림 먼저 표시
  const handleGpxButtonClick = () => {
    if (!fullPathCoordinates.length) return
    setShowGpxConfirm(true)
  }

  // 0531 창현 - GPX 내보내기: 확인 알림에서 '확인' 눌렀을 때 실제 다운로드 실행
  const exportGPX = () => {
    setShowGpxConfirm(false)
    setGpxFlash(true)
    setTimeout(() => setGpxFlash(false), 600)
    // 0531 창현 - 기존 exportGPXFile을 LRU 자동 저장 기능이 추가된 버전으로 교체
    exportGPXWithLRU(fullPathCoordinates, 'Shape Runner 경로', shape, Number(distance))
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1500)
  }

  const route = generateRoute({ shape, startPoint, distance, rotation })
  const denseRoute = densifyRoute(route, 5)
  // 0531 창현 - useMemo로 감싸서 graph가 바뀔 때만 재계산 (매 렌더링마다 실행되던 성능 문제 수정)
  const fullPathCoordinates = useMemo(
    () => generateFullPathCoordinates({ graph, denseRoute }),
    [graph] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // 0531 창현 - 경로 목록 페이지 표시 중이면 RouteListPage 렌더링
  if (showList !== null) {
    return (
      <RouteListPage
        initialTab={showList}
        onBack={() => setShowList(null)}
        onLoadRoute={(route) => {
          setShowList(null)
        }}
      />
    )
  }

  // 0531 창현 - 경로 생성하기 버튼 활성화 조건: 도형, 거리, 시작점 모두 설정된 경우
  const canGenerate = !!shape && !!distance && !!startPoint && !loading


  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
        <p style={{ marginTop: '20px', color: '#666', marginBottom: '12px' }}>
          모양 기반 러닝/산책 루트 생성
        </p>

        {/* 0531 창현 - 경로 목록 버튼 (최근 생성 경로 / 즐겨찾는 경로) */}
        <button
          onClick={() => setShowList('recent')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1.5px solid #189b81',
            background: 'white',
            color: '#189b81',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          📋 최근 생성 경로 / 즐겨찾는 경로
        </button>

        <h3 style={{ marginTop: '0', marginBottom: '8px', fontSize: '14px', color: '#444' }}>
          1. 생성할 루트 모양을 선택하세요
        </h3>
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
          loading={loading}
          shape={shape}
          distance={distance}
        />

        {/* 0531 창현 - 경로 생성하기 버튼 추가: 클릭 시 도로 데이터 로드 및 실제 경로 생성 */}
        <div style={{ margin: '4px 0 16px' }}>
          <button
            onClick={handleGenerateRoute}
            disabled={!canGenerate}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: canGenerate ? '#189b81' : '#e0e0e0',
              color: canGenerate ? 'white' : '#aaa',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease',
            }}
          >
            {loading ? '경로 생성 중...' : '🚀 경로 생성하기'}
          </button>
          {/* 0531 창현 - 경로 생성 조건 미충족 시 안내 문구 */}
          {!canGenerate && !loading && (
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px', marginBottom: 0 }}>
              {!shape ? '도형을 선택해주세요' : !distance ? '거리를 입력해주세요' : !startPoint ? '지도에서 시작 지점을 클릭해주세요' : ''}
            </p>
          )}
        </div>

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

        {/* 🛠️ 최영 담당 추가/수정 파트: 원본 Shape와 실제 도로 매핑 경로 간의 유사도 등급 측정 UI 연동 */}
        <ShapeAccuracy
          route={route}
          fullPathCoordinates={
            fullPathCoordinates
          }
        />

        <RouteComplexity
          path={fullPathCoordinates}
        />

        <h3 style={{ marginTop: '20px', fontSize: '14px', color: '#444' }}>
          5. GPX 파일로 저장하세요
        </h3>

        {/* 0531 창현 - GPX 버튼: onClick을 확인 알림 표시 함수로 변경 */}
        <button
          onClick={handleGpxButtonClick}
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
            color: !fullPathCoordinates.length ? '#aeacac' : '#ffffff',
            cursor: fullPathCoordinates.length ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease, color 0.2s ease',
          }}
        >
          Export GPX
        </button>

        <h3 style={{ marginTop: '20px', marginBottom: '8px', fontSize: '14px', color: '#444' }}>
          ✨<br />
          생성된 gpx 파일을 카카오맵 등에 불러와<br />
          즐겁고 신선한 러닝 경험을 즐기세요!
        </h3>
      </div>

      {/* 0531 창현 - GPX 내보내기 확인 알림 팝업 */}
      {showGpxConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '28px 32px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              minWidth: '260px',
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              GPX 파일을 저장하시겠습니까?
            </p>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
              생성된 경로가 .gpx 파일로 다운로드됩니다.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={exportGPX}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#189b81',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                확인
              </button>
              <button
                onClick={() => setShowGpxConfirm(false)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#444',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

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
          }}
        >
          ✨ 저장 완료!
        </div>
      )}
    </div>
  )
}

export default App
