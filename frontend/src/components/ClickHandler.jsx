// [이창현 수정] ClickHandler.jsx  ( frontend/src/components/ClickHandler.jsx )
// 0531 창현 - 드래그/클릭 구분 로직 추가
// 0531 창현 - 경로 생성 버튼 분리: 클릭 시 시작점만 설정, 도로 데이터는 버튼 클릭 시 불러옴
import { useRef } from 'react'
import { useMapEvents } from 'react-leaflet'

/**
 * [이창현 수정] 지도 클릭 이벤트 핸들러 컴포넌트
 *
 * [변경 사항]
 * 1. 드래그/클릭 구분 로직 추가
 *    기존: 지도 이동(드래그) 후 마우스를 뗄 때도 클릭으로 인식 → 시작점 의도치 않게 변경
 *    개선: mousedown 위치를 기록하고 click 시 이동 거리 5px 이상이면 드래그로 간주해 클릭 무시
 *
 * 2. 클릭 시 시작점만 설정 (도로 데이터 로드 분리)
 *    기존: 클릭 즉시 도로 데이터 로드까지 수행 → 불필요한 서버 요청 발생
 *    개선: 시작점 설정만 수행, 도로 데이터 로드는 "경로 생성하기" 버튼 클릭 시 수행
 *
 * @param {Function} setStartPoint - 시작점 좌표 setter [lat, lng]
 * @param {boolean}  loading       - 도로 데이터 로딩 중 여부 (로딩 중 클릭 무시)
 */
function ClickHandler({ setStartPoint, loading }) {

  // 0531 창현 - 마우스 다운 위치를 ref로 저장 (드래그/클릭 구분용)
  // useRef: 값 변경 시 리렌더링 없이 유지되므로 이벤트 간 위치 공유에 적합
  const mouseDownPos = useRef(null)

  useMapEvents({

    /**
     * [이창현 추가] mousedown — 클릭 시작 위치 기록
     * 이후 click 이벤트에서 이동 거리를 계산해 드래그 여부를 판단한다.
     */
    mousedown(e) {
      // 0531 창현 - 클릭 시작 위치 기록
      mouseDownPos.current = {
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
      }
    },

    /**
     * [이창현 수정] click — 드래그 여부 판단 후 시작점 설정
     * 마우스 이동 거리가 5px 이상이면 드래그로 간주하여 클릭 처리를 중단한다.
     */
    click(e) {
      if (loading) return

      // 0531 창현 - 이동 거리 5px 이상이면 드래그로 간주, 클릭 무시
      if (mouseDownPos.current) {
        const dx = e.originalEvent.clientX - mouseDownPos.current.x
        const dy = e.originalEvent.clientY - mouseDownPos.current.y
        const moveDist = Math.sqrt(dx * dx + dy * dy)
        if (moveDist > 5) return
      }

      // 0531 창현 - 시작점만 설정 (도로 데이터 로드는 경로 생성하기 버튼에서 수행)
      setStartPoint([e.latlng.lat, e.latlng.lng])
    },
  })

  return null
}

export default ClickHandler
