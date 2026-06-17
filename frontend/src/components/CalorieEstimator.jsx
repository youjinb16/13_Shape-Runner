import React, { useState } from 'react'

/**
 * 0617 강서현
 *
 * 예상 칼로리 소모량 계산 모듈
 *
 * 역할 :
 * 사용자의 신체정보와
 * 선택한 경로의 거리를 이용하여
 * 예상 칼로리 소모량을 계산한다.
 *
 * 또한 음식 기준으로 환산하여
 * 사용자가 직관적으로 이해할 수 있도록 제공한다.
 *
 * 입력 :
 * - 성별
 * - 나이
 * - 키
 * - 체중
 * - 거리
 *
 * 출력 :
 * - 예상 칼로리 소모량
 * - 음식 환산 결과
 *
 * 사용 자료구조 :
 * - Number
 * - React State(useState)
 *
 * 사용 알고리즘 :
 * - MET 기반 칼로리 추정 알고리즘
 */

export default function CalorieEstimator({
  distance,
}) {

  /**
   * 0617 강서현
   *
   * 사용자 입력 정보 저장 State
   */
  const [gender, setGender] =
    useState('male')

  const [age, setAge] =
    useState('25')

  const [height, setHeight] =
    useState('170')

  const [weight, setWeight] =
    useState('70')

  if (!distance) return null

  /**
   * 0617 강서현
   *
   * 핵심 코드
   *
   * MET 기반 칼로리 계산
   *
   * 칼로리 = 거리 × 체중 × 1.036
   *
   * 러닝 시 평균 에너지 소비량을
   * 기반으로 계산
   */
  const calories =
    Number(distance) *
    Number(weight) *
    1.036

  /**
   * 0617 강서현
   *
   * 음식 환산 계산
   *
   * 사용자가 소모한 칼로리를
   * 음식 기준으로 직관적으로 표현
   */
  const rice =
    calories / 300

  const burger =
    calories / 550

  const pizza =
    calories / 285

  const cola =
    calories / 140

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '16px',
        borderRadius: '12px',
        background: '#fff4e5',
        border: '1px solid #ffd59e',
      }}
    >
      <h3>🔥 예상 칼로리 소모량</h3>

<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px', // 👈 세트(성별, 나이, 키...)와 세트 사이의 간격을 넓힙니다.
  }}
>
  {/* 1. 성별 세트 */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <h5 style={{ textAlign: 'left', margin: 0 }}>1. 성별</h5>
    <select
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      style={{ padding: '8px', borderRadius: '4px' }} // 약간의 스타일 추가
    >
      <option value="male">남성</option>
      <option value="female">여성</option>
    </select>
  </div>

  {/* 2. 나이 세트 */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <h5 style={{ textAlign: 'left', margin: 0 }}>2. 나이</h5>
    <input
      type="number"
      placeholder="나이"
      value={age}
      onChange={(e) => setAge(e.target.value)}
      style={{ padding: '8px', borderRadius: '4px',}}
    />
  </div>

  {/* 3. 키 세트 */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <h5 style={{ textAlign: 'left', margin: 0 }}>3. 키(cm)</h5>
    <input
      type="number"
      placeholder="키(cm)"
      value={height}
      onChange={(e) => setHeight(e.target.value)}
      style={{ padding: '8px', borderRadius: '4px' }}
    />
  </div>

  {/* 4. 체중 세트 */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <h5 style={{ textAlign: 'left', margin: 0 }}>4. 체중(kg)</h5>
    <input
      type="number"
      placeholder="체중(kg)"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      style={{ padding: '8px', borderRadius: '4px' }}
    />
  </div>
</div>

<hr />
      <p>
        예상 칼로리 소모량 :
        {' '}
        <strong>
          {calories.toFixed(0)} kcal
        </strong>
      </p>

      <h4>
        🍽️ 음식으로 환산하면
      </h4>

      <p>
        🍚 밥 약
        {' '}
        <strong>
          {rice.toFixed(1)}
        </strong>
        공기
      </p>

      <p>
        🍔 햄버거 약
        {' '}
        <strong>
          {burger.toFixed(1)}
        </strong>
        개
      </p>

      <p>
        🍕 피자 약
        {' '}
        <strong>
          {pizza.toFixed(1)}
        </strong>
        조각
      </p>

      <p>
        🥤 콜라 약
        {' '}
        <strong>
          {cola.toFixed(1)}
        </strong>
        캔
      </p>
    </div>
  )
}