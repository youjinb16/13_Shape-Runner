import {
  calculateShapeAccuracy
} from '../utils/shapeAccuracy'

export default function ShapeAccuracy({
  route,
  fullPathCoordinates,
}) {

  if (
    !fullPathCoordinates ||
    fullPathCoordinates.length === 0
  ) {
    return null
  }

  const score =
    Number(
      calculateShapeAccuracy(
        route,
        fullPathCoordinates
      )
    )

  let grade = 'Poor'
  let message = ''

  if (score >= 90) {
    grade = 'Excellent'
    message =
      '원본 Shape가 매우 잘 유지되었습니다.'
  }
  else if (score >= 80) {
    grade = 'Good'
    message =
      'Shape가 대체로 유지되었습니다.'
  }
  else if (score >= 65) {
    grade = 'Fair'
    message =
      'Shape 일부가 왜곡되었습니다.'
  }
  else {
    message =
      'Shape 왜곡이 큽니다. 더 긴 거리를 권장합니다.'
  }

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        background: '#fff',
      }}
    >
      <h3>
        ⭐ Shape Quality
      </h3>

      <p>
        점수:
        <strong>
          {' '}
          {score.toFixed(1)}점
        </strong>
      </p>

      <p>
        등급:
        <strong>
          {' '}
          {grade}
        </strong>
      </p>

      <p
        style={{
          color: '#666',
          marginTop: '8px',
        }}
      >
        {message}
      </p>
    </div>
  )
}