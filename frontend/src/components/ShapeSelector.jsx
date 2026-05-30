function ShapeSelector({
  shape,
  setShape,
  getShapeButtonStyle,
}) {
  return (
    <>
      <button
        onClick={() => setShape('heart')}
        style={getShapeButtonStyle('heart')}
      >
        Heart
      </button>

      <button
        onClick={() => setShape('star')}
        style={getShapeButtonStyle('star')}
      >
        Star
      </button>

      <button
        onClick={() => setShape('bone')}
        style={getShapeButtonStyle('bone')}
      >
        Bone
      </button>
    </>
  )
}

export default ShapeSelector