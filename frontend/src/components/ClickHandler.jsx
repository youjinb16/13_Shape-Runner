// 0531 창현 - 지도 클릭 씹힘 수정: 드래그와 클릭 구분 로직 추가
// 0531 창현 - 경로 생성 버튼 분리: 클릭 시 시작점만 설정, 도로 데이터는 버튼 클릭 시 불러옴
import { useRef } from 'react'
import { useMapEvents } from 'react-leaflet'

function ClickHandler({
  setStartPoint,
  loading,
}) {

  // 0531 창현 - 마우스 다운 위치를 ref로 저장 (드래그/클릭 구분용)
  const mouseDownPos = useRef(null)

  useMapEvents({

    // 0531 창현 - mousedown: 클릭 시작 위치 기록
    mousedown(e) {
      mouseDownPos.current = {
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
      }
    },

    click(e) {
      if (loading) return

      // 0531 창현 - 드래그/클릭 구분: 마우스 이동 거리가 5px 이상이면 드래그로 간주하여 클릭 무시
      if (mouseDownPos.current) {
        const dx = e.originalEvent.clientX - mouseDownPos.current.x
        const dy = e.originalEvent.clientY - mouseDownPos.current.y
        const moveDist = Math.sqrt(dx * dx + dy * dy)
        if (moveDist > 5) return
      }

      // 0531 창현 - 시작점만 설정, 도로 데이터 로드는 하지 않음 (버튼 클릭 시 수행)
      setStartPoint([e.latlng.lat, e.latlng.lng])
    },
  })

  return null
}

export default ClickHandler
