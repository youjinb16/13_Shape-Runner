import React from "react";
/**
 * 0607 강서현
 *
 * RouteComplexity 모듈
 *
 * 역할 :
 * 생성된 러닝 경로의 복잡도를 분석하여
 * 난이도(Easy / Medium / Hard),
 * 급격한 회전 수(Sharp Turn),
 * 평균 Segment 길이,
 * 전체 경로 길이를 사용자에게 제공한다.
 *
 * 사용 자료구조 :
 * - Array
 * - Object
 *
 * 사용 알고리즘 :
 * - 방향 변화 계산 알고리즘 (Vector Angle Calculation)
 * - 선형 탐색 알고리즘 (Linear Search)
 * - 임계값 기반 분류 알고리즘 (Threshold Classification)
 */

//오류 헬퍼 함수 - 박유진 추가

// 0607 강서현
// 벡터 내적(Dot Product)을 이용하여
// 경로상의 회전 각도를 계산하는 함수
function getLat(point) {
  return Array.isArray(point) ? point[0] : point.lat;
}

function getLng(point) {
  return Array.isArray(point) ? point[1] : point.lng;
}

/**
 * 생성된 러닝 경로의 복잡도를 분석합니다.
 *
 * @param {Array} path
 * [{lat, lng}, ...]
 */

function calculateAngle(a, b, c) {
  const ab = { //원래 코드와 호응하도록 변경 - 박유진
    x: getLng(b) - getLng(a),
    y: getLat(b) - getLat(a),
  };

  const bc = {
    x: getLng(c) - getLng(b),
    y: getLat(c) - getLat(b),
  };

  // ==========================
  // Vector Dot Product
  // ==========================

  const dot =
    ab.x * bc.x +
    ab.y * bc.y;

  const magAB = Math.sqrt(
    ab.x ** 2 + ab.y ** 2
  );

  const magBC = Math.sqrt(
    bc.x ** 2 + bc.y ** 2
  );

  const cosTheta =
    dot / (magAB * magBC);

  return (
    Math.acos(
      Math.max(-1, Math.min(1, cosTheta))
    ) *
    (180 / Math.PI)
  );
}


/**
 * 0607 강서현
 *
 * 역할 :
 * 경로 전체를 선형 탐색하여
 * 급격한 회전(Sharp Turn)의 개수를 계산한다.
 *
 * 사용 자료구조 :
 * - Array
 *
 * 사용 알고리즘 :
 * - 선형 탐색 (Linear Search)
 * - 방향 변화 계산 알고리즘
 */

function calculateSharpTurnCount(
  path,
  threshold = 120
) {
  let sharpTurns = 0;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const angle =
      calculateAngle(
        prev,
        curr,
        next
      );

    // ==========================
    // Threshold Filtering
    // ==========================

    if (angle > threshold) {
      sharpTurns++;
    }
  }

  return sharpTurns;
}


// ======================================
// 거리 계산
// ======================================

function calculateDistance(a, b) { //메인 코드와 호응하도록 변경, km로 단위 통일 - 박유진
  const lat1 = getLat(a);
  const lon1 = getLng(a);
  const lat2 = getLat(b);
  const lon2 = getLng(b);

  const R = 6371; // 지구 반지름 (km)

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));

  return R * c; // km
}

/**
 * 0607 강서현
 *
 * 역할 :
 * 경로 전체 길이를 계산한다.
 *
 * 사용 자료구조 :
 * - Array
 *
 * 사용 알고리즘 :
 * - 선형 탐색 (Linear Search)
 */
export function calculateTotalDistance(path) {
  let total = 0;

  for (let i = 0; i < path.length - 1; i++) {
    total += calculateDistance(
      path[i],
      path[i + 1]
    );
  }

  return total;
}


/**
 * 0607 강서현
 *
 * 역할 :
 * Sharp Turn 개수와
 * 평균 Segment 길이를 기준으로
 * 경로 난이도를 분류한다.
 *
 * 사용 알고리즘 :
 * - 임계값 기반 분류 알고리즘
 *   (Threshold Classification)
 */
function classifyDifficulty(
  sharpTurns,
  avgSegmentLength
) {
  // ==========================
  // Threshold Classification
  // ==========================

  if (
    sharpTurns < 5 &&
    avgSegmentLength > 0.0005
  ) {
    return "Easy";
  }

  if (sharpTurns < 12) {
    return "Medium";
  }

  return "Hard";
}



// 메인 컴포넌트

/**
 * 0607 강서현
 *
 * RouteComplexity 메인 컴포넌트
 *
 * 역할 :
 * 경로 복잡도 분석 결과를
 * 사용자에게 시각적으로 출력한다.
 */

export default function RouteComplexityPanel({
  path,
}) {

  console.log(path);

  if (!path || path.length < 3) {
    return null;
  }

  const sharpTurns =
    calculateSharpTurnCount(path);

  const totalDistance =
    calculateTotalDistance(path);

  const avgSegmentLength =
    totalDistance / path.length;

  const difficulty =
    classifyDifficulty(
      sharpTurns,
      avgSegmentLength
    );

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "16px",
        borderRadius: "12px",
        background: "#ffffff",
        border: "1px solid #ddd",
      }}
    >
      <h3
      style={{
         margin: '0 0 12px 0', fontSize: '16px', color: '#333' 
      }}>
        🗺️ 경로 복잡도 평가(Route Complexity) 🗺️
      </h3>

      <p>
        코스 난이도:
        {" "}
        <strong>
          {difficulty}
        </strong>
      </p>

      <p>
        급커브 수:
        {" "}
        <strong>
        {sharpTurns}회
        </strong>
      </p>

      <p>
        평균 구간 길이: <strong>{(avgSegmentLength * 1000).toFixed(0)} m </strong>
      </p>

      <p>
        총 거리: <strong>{totalDistance.toFixed(2)} km </strong>
      </p>
    </div>
  );
}
