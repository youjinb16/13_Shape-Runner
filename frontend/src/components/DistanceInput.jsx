function DistanceInput({
  distance,
  setDistance,
}) {

  return (
    <>
      <h3
        style={{
          marginTop: '20px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#444',
        }}
      >
        2. 원하는 루트 길이를 입력하세요(km)
      </h3>

      <div style={{ marginTop: '10px' }}>
        <input
          type="number"
          step="0.01"
          placeholder="Enter distance (km)"
          value={distance}
          onChange={(e) =>
            setDistance(e.target.value)
          }
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '200px',
            marginBottom: '8px',
          }}
        />
      </div>
    </>
  )
}

export default DistanceInput