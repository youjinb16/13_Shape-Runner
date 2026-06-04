// =====================================================
// useRouteList.js  ( frontend/src/hooks/useRouteList.js )
// [이창현 추가] 최근 경로(LRU) & 즐겨찾기 상태 관리 커스텀 훅
//
// routeModule.js의 저장 로직을 React 상태(state)와 연결한다.
// 데이터 변경 시 화면이 자동으로 업데이트되며,
// 즐겨찾기 토글 시 LRU·즐겨찾기 양방향 연동을 처리한다.
// =====================================================

import { useState, useCallback } from 'react';
import {
  getLRURoutes,
  removeFromLRU,
  getFavRoutes,
  addToFav,
  removeFromFav,
  isFavorite,
} from '../utils/routeModule';

/**
 * [이창현 추가] 최근 경로(LRU)와 즐겨찾기 목록을 관리하는 커스텀 훅
 *
 * @returns {Object}
 *   - lruRoutes   {Array}    최근 경로 목록 (최신순, 최대 3개)
 *   - favRoutes   {Array}    즐겨찾기 목록 (최신 추가순)
 *   - removeLRU   {Function} 최근 경로 삭제 (연동된 즐겨찾기도 자동 제거)
 *   - toggleFav   {Function} 즐겨찾기 토글 (추가/취소)
 *   - removeFav   {Function} 즐겨찾기 삭제
 *   - isFavorite  {Function} 즐겨찾기 여부 확인 (routeId → boolean)
 *   - refresh     {Function} 목록 강제 새로고침
 */
const useRouteList = () => {
  // 최근 경로 목록 state — 초기값: getLRURoutes()
  const [lruRoutes, setLruRoutes] = useState(() => getLRURoutes());
  // 즐겨찾기 목록 state — 초기값: getFavRoutes()
  const [favRoutes, setFavRoutes] = useState(() => getFavRoutes());

  /**
   * [이창현 추가] 저장소에서 최신 데이터를 읽어 state 갱신
   * 삭제/토글 등 변경 후 화면을 최신 상태로 동기화하기 위해 호출한다.
   */
  const refresh = useCallback(() => {
    setLruRoutes(getLRURoutes());
    setFavRoutes(getFavRoutes());
  }, []);

  /**
   * [이창현 추가] 최근 경로 삭제
   * routeModule.js의 removeFromLRU()를 호출하며,
   * 연동된 즐겨찾기도 자동으로 함께 제거된다.
   * @param {string} routeId - 삭제할 경로 ID
   */
  const removeLRU = useCallback((routeId) => {
    removeFromLRU(routeId);
    refresh();
  }, [refresh]);

  /**
   * [이창현 추가] 즐겨찾기 토글
   * - 이미 즐겨찾기인 경우: 즐겨찾기에서 제거
   * - 즐겨찾기가 아닌 경우: 현재 경로 데이터를 즐겨찾기로 복사 저장
   * @param {Object} route - 토글할 경로 객체
   */
  const toggleFav = useCallback((route) => {
    if (isFavorite(route.id)) removeFromFav(route.id);
    else addToFav(route);
    refresh();
  }, [refresh]);

  /**
   * [이창현 추가] 즐겨찾기 삭제
   * @param {string} routeId - 삭제할 경로 ID
   */
  const removeFav = useCallback((routeId) => {
    removeFromFav(routeId);
    refresh();
  }, [refresh]);

  return { lruRoutes, favRoutes, removeLRU, toggleFav, removeFav, isFavorite, refresh };
};

export default useRouteList;
