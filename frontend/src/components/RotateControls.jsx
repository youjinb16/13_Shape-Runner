function RotateControls({
  rotation,
  handleRotateLeft,
  handleRotateRight,
  leftFlash,
  rightFlash,
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
        4. 루트 방향을 조정하세요
      </h3>

      <button
        onClick={handleRotateLeft}
        style={{
          marginRight: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: leftFlash
            ? '#189b81'
            : 'white',
          transition: 'background-color 0.6s ease',
          marginBottom: '5px',
          boxShadow: leftFlash
            ? '0 4px 12px rgba(0,0,0,0.15)'
            : 'none',
        }}
      >
        Rotate Left
      </button>

      <button
        onClick={handleRotateRight}
        style={{
          marginRight: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: rightFlash
            ? '#fc8a33'
            : 'white',
          transition: 'background-color 0.6s ease',
          marginBottom: '5px',
          boxShadow: rightFlash
            ? '0 4px 12px rgba(0,0,0,0.15)'
            : 'none',
        }}
      >
        Rotate Right
      </button>

      <p style={{ marginBottom: '5px' }}>
        Rotation:{' '}
        <span
          style={{
            color:
              rotation === 0
                ? '#999'
                : '#1976d2',
          }}
        >
          {rotation}°
        </span>
      </p>
    </>
  )
}

export default RotateControls