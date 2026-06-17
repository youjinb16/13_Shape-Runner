import React, { useState } from 'react'

/**
 * 0617 강서현
 *
 * Zone2HeartRate 모듈
 *
 * 역할 :
 * 사용자의 나이를 입력받아
 * Zone2 운동 권장 심박수를 계산한다.
 *
 * 입력 :
 * - 나이(age)
 *
 * 출력 :
 * - 최대 심박수
 * - Zone2 권장 심박수 범위
 *
 * 사용 자료구조 :
 * - Number
 * - React State(useState)
 *
 * 사용 알고리즘 :
 * - Maximum Heart Rate Estimation
 * - Threshold Range Classification
 *
 * 계산식 :
 * 최대심박수 = 220 - 나이
 *
 * Zone2
 * = 최대심박수의 60~70%
 */

export default function Zone2HeartRate() {

  /**
   *
   * 사용자 나이 입력 State
   */
  const [age, setAge] = useState(25)

  /**
   *
   * 핵심 코드
   *
   * Maximum Heart Rate Estimation
   *
   * 최대 심박수 계산
   */
  const maxHeartRate =
    220 - Number(age)

  /**
   *
   * 핵심 코드
   *
   * Threshold Range Classification
   *
   * Zone2 권장 심박수 범위 계산
   */
  const minZone =
    Math.round(maxHeartRate * 0.6)

  const maxZone =
    Math.round(maxHeartRate * 0.7)

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '16px',
        borderRadius: '12px',
        background: '#f7f0ff',
        border: '1px solid #d5c2ff',
      }}
    >
      <h3>
        ❤️ Zone2 추천 심박수
      </h3>

      <p>
        나이 입력
      </p>

      <input
        type="number"
        min="10"
        max="100"
        value={age}
        onChange={(e) =>
          setAge(e.target.value)
        }
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />

      <hr />

      <p>
        최대 심박수 :
        {' '}
        <strong>
          {maxHeartRate} bpm
        </strong>
      </p>

      <p>
        Zone2 권장 범위 :
        {' '}
        <strong>
          {minZone} ~ {maxZone} bpm
        </strong>
      </p>

      <p
        style={{
          fontSize: '13px',
          color: '#666',
        }}
      >
        Zone2는 지방 연소 효율이 높고
        장시간 지속 가능한 유산소 운동 강도입니다.
      </p>
    </div>
  )
}