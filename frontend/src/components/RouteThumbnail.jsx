// =====================================================
// RouteThumbnail.jsx  ( frontend/src/components/RouteThumbnail.jsx )
// 0617 창현 - 추가: 경로 좌표 배열을 SVG 미니맵 썸네일로 그리는 컴포넌트 신규 생성
//
// 역할:
//   최근 경로 / 즐겨찾기 / 커뮤니티 카드에서 "이게 무슨 모양 코스였는지"를
//   한눈에 알아볼 수 있도록, 저장된 coordinates 배열을 작은 SVG 그림으로 렌더링한다.
//
// 선택 이유 (B안):
//   Leaflet 지도 화면을 그대로 이미지로 캡처하는 방식은 외부 타일의 CORS 문제로
//   배경이 비거나 깨질 수 있고 별도 라이브러리/API 키가 필요하다.
//   반면 좌표만으로 SVG를 그리면 외부 의존성·API 키가 전혀 없고,
//   저장 용량도 들지 않으며(좌표는 이미 route 객체에 있음) 경로 윤곽이 깔끔하게 보인다.
//   ※ 실제 배포 단계에서는 정적 지도 이미지 API로 교체해 지도 배경까지 표시 가능.
// =====================================================

// 0617 창현 - 추가: 도형 종류별 선 색상 (썸네일 강조용)
const SHAPE_COLORS = {
  heart: '#e8506e',
  star: 'rgb(106, 113, 247)',
  bone: '#fc8a33',
}

/**
 * 0617 창현 - 추가: 경로 좌표 → SVG 미니맵 변환 컴포넌트
 *
 * @param {Array}  coordinates - [[lat, lng], ...] 경로 좌표 배열
 * @param {string} shape       - 도형 종류 (heart/star/bone) → 선 색상 결정
 * @param {number} size        - 썸네일 한 변 크기(px), 기본 84
 */
function RouteThumbnail({ coordinates, shape, size = 84 }) {
  // 0617 창현 - 추가: 좌표가 없거나 2개 미만이면 플레이스홀더 표시
  if (!coordinates || coordinates.length < 2) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: '#f2f2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#bbb',
          fontSize: 22,
        }}
      >
        🗺️
      </div>
    )
  }

  const color = SHAPE_COLORS[shape] ?? '#189b81'
  const pad = 8 // 0617 창현 - 추가: 썸네일 내부 여백

  // 0617 창현 - 추가: 위/경도 범위를 구해서 SVG 좌표계로 정규화
  const lats = coordinates.map((c) => c[0])
  const lngs = coordinates.map((c) => c[1])
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  // 0617 창현 - 추가: 가로/세로 비율을 유지하기 위해 더 큰 범위를 기준으로 스케일 계산
  const rangeLat = maxLat - minLat || 0.0001
  const rangeLng = maxLng - minLng || 0.0001
  const range = Math.max(rangeLat, rangeLng)

  // 0617 창현 - 추가: 좌표 → SVG 픽셀 변환 함수 (lat은 화면 y축이 반대라 뒤집음)
  const inner = size - pad * 2
  const toXY = ([lat, lng]) => {
    const x = pad + ((lng - minLng) / range) * inner + (inner - (rangeLng / range) * inner) / 2
    const y = pad + (1 - (lat - minLat) / range) * inner - (inner - (rangeLat / range) * inner) / 2
    return [x, y]
  }

  // 0617 창현 - 추가: 좌표 배열을 SVG polyline points 문자열로 변환
  const points = coordinates.map(toXY).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        borderRadius: 10,
        background: 'linear-gradient(135deg, #f7fbfa 0%, #eef5f3 100%)',
        border: '1px solid #e0ebe8',
        flexShrink: 0,
      }}
    >
      {/* 0617 창현 - 추가: 경로 선 (도형 색상으로 강조) */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default RouteThumbnail
