import React from "react";

/**
 * 생성된 러닝 경로의 복잡도를 분석합니다.
 *
 * @param {Array} path
 * [{lat, lng}, ...]
 */

function calculateAngle(a, b, c) {
  const ab = {
    x: b.lng - a.lng,
    y: b.lat - a.lat,
  };

  const bc = {
    x: c.lng - b.lng,
    y: c.lat - b.lat,
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


// ======================================
// Sharp Turn 계산
// ======================================

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

function calculateDistance(a, b) {
  const dx = a.lng - b.lng;
  const dy = a.lat - b.lat;

  return Math.sqrt(
    dx * dx + dy * dy
  );
}

function calculateTotalDistance(path) {
  let total = 0;

  for (let i = 0; i < path.length - 1; i++) {
    total += calculateDistance(
      path[i],
      path[i + 1]
    );
  }

  return total;
}


// ======================================
// 난이도 분류
// ======================================

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


// ======================================
// 메인 컴포넌트
// ======================================

export default function RouteComplexityPanel({
  path,
}) {
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
        background: "#f4f4f4",
        border: "1px solid #ddd",
      }}
    >
      <h3>
        Route Complexity
      </h3>

      <p>
        Difficulty:
        {" "}
        <strong>
          {difficulty}
        </strong>
      </p>

      <p>
        Sharp Turns:
        {" "}
        {sharpTurns}
      </p>

      <p>
        Avg Segment:
        {" "}
        {avgSegmentLength.toFixed(6)}
      </p>

      <p>
        Total Distance:
        {" "}
        {totalDistance.toFixed(6)}
      </p>
    </div>
  );
}
