import React, { useState } from 'react'

/**
 * 0617 강서현
 *
 * 예상 완주 시간 계산 모듈
 *
 * 역할 :
 * 사용자가 입력한 목표 페이스(분/km)를 기반으로
 * 선택한 경로의 예상 완주 시간을 계산한다.
 *
 * 입력 :
 * - distance (km)
 * - 목표 페이스 (분/km)
 *
 * 출력 :
 * - 예상 운동 시간
 *
 * 사용 자료구조 :
 * - Number
 * - React State(useState)
 *
 * 사용 알고리즘 :
 * - Linear Estimation Algorithm
 *
 * 계산식 :
 * 운동시간 = 거리 × 목표페이스
 */

export default function PaceEstimator({
  distance,
}) {

  /**
   * 0617 강서현
   *
   * 목표 페이스 저장 State
   *
   * 단위 :
   * 분/km
   *
   * 예시 :
   * 6 → 1km를 6분에 주행
   */
  const [pace, setPace] = useState(6)

  if (!distance) return null

  /**
   * 0617 강서현
   *
   * 핵심 코드
   *
   * Linear Estimation Algorithm
   *
   * 거리 × 목표 페이스
   *
   * 예시 :
   * 5km × 6분/km = 30분
   */
  const totalMinutes =
    Number(distance) *
    Number(pace)

  const hours =
    Math.floor(totalMinutes / 60)

  const minutes =
    Math.round(totalMinutes % 60)

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '16px',
        borderRadius: '12px',
        background: '#189b8129',
        border: '1px solid #b8ddff',
      }}
    >
      <h3>
        ⏱️ 예상 완주 시간
      </h3>

      <p>
        목표 페이스 (분/km)
      </p>

      <input
        type="number"
        min="3"
        max="15"
        step="0.5"
        value={pace}
        onChange={(e) =>
          setPace(e.target.value)
        }
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />

      <p
        style={{
          marginTop: '15px',
        }}
      >
        예상 운동 시간 :
        {' '}
        <strong>
          {hours > 0
            ? `${hours}시간 ${minutes}분`
            : `${minutes}분`}
        </strong>
      </p>
    </div>
  )
}