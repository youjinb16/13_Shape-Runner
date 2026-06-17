import { calculateShapeAccuracy } from '../utils/shapeAccuracy';

export default function ShapeAccuracy({ route, fullPathCoordinates }) {
  if (!fullPathCoordinates || fullPathCoordinates.length === 0) {
    return null;
  }

  // [최영] 구조 분해 할당을 통해 융합 알고리즘의 점수 데이터셋 추출
  const { accuracyScore, dtwScore, finalCombinedScore } = calculateShapeAccuracy(
    route,
    fullPathCoordinates
  );

  // 등급 기준은 최종 합성 점수(finalCombinedScore)를 기반으로 판정
  let grade = 'Poor';
  let message = '';

  if (finalCombinedScore >= 90) {
    grade = 'Excellent';
    message = '원본 Shape의 형태와 주행 방향 순서가 매우 완벽하게 유지되었습니다. ✨';
  } else if (finalCombinedScore >= 80) {
    grade = 'Good';
    message = '도형의 전반적인 모양과 흐름이 매끄럽게 유지되었습니다. 👍';
  } else if (finalCombinedScore >= 65) {
    grade = 'Fair';
    message = '실제 도로 사정으로 인해 Shape의 일부가 다소 왜곡되었습니다. 🏃‍♂️';
  } else {
    message = '도형 왜곡이 큽니다. 형태를 더 잘 표현하기 위해 조금 더 긴 주행 거리를 권장합니다. 🧭';
  }

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
        📊 다각도 경로 유사도 평가 (Shape Accuracy) 📊
      </h3>
      
      {/* 등급 및 피드백 메시지 표시 파트 */}
      <div style={{ marginBottom: '14px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: '15px',
          color: grade === 'Excellent' ? '#189b81' : grade === 'Good' ? '#007bff' : '#f8801f' 
        }}>
          [{grade}] 최종 점수: {finalCombinedScore}점
        </span>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
          {message}
        </p>
      </div>

      {/* 교수님 지시사항인 줄글 나열 방지용 정량적 지표 바(Bar) 구성 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#555' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '2px' }}>
            <span>📍 최단 거리 공간 매칭 정확도 (Nearest Distance)</span>
            <span style={{ fontWeight: 'bold', marginLeft: 'auto' }}>{accuracyScore} / 100</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px' }}>
            <div style={{ width: `${accuracyScore}%`, height: '100%', background: '#189b81', borderRadius: '3px' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '2px' }}>
            <span>🔄 궤적/순서 방향성 동적 정합도 (DTW 알고리즘)</span>
            <span style={{ fontWeight: 'bold', marginLeft: 'auto' }}>{dtwScore} / 100</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px' }}>
            <div style={{ width: `${dtwScore}%`, height: '100%', background: '#4a90e2', borderRadius: '3px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
