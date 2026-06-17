import { useRef } from 'react'
import { useMapEvents } from 'react-leaflet'

/**
 *
 * @param {Function} setStartPoint 
 * @param {boolean}  loading      
 */
function ClickHandler({ setStartPoint, loading }) {

  const mouseDownPos = useRef(null)

  useMapEvents({

    mousedown(e) {
      mouseDownPos.current = {
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
      }
    },


    click(e) {
      if (loading) return

      if (mouseDownPos.current) {
        const dx = e.originalEvent.clientX - mouseDownPos.current.x
        const dy = e.originalEvent.clientY - mouseDownPos.current.y
        const moveDist = Math.sqrt(dx * dx + dy * dy)
        if (moveDist > 5) return
      }

      setStartPoint([e.latlng.lat, e.latlng.lng])
    },
  })

  return null
}

export default ClickHandler
