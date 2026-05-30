// =====================================================
// useRouteList.js  ( frontend/src/hooks/useRouteList.js )
// 최근 경로(LRU) & 즐겨찾기 React 상태 관리 훅
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

const useRouteList = () => {
  const [lruRoutes, setLruRoutes] = useState(() => getLRURoutes());
  const [favRoutes, setFavRoutes] = useState(() => getFavRoutes());

  const refresh = useCallback(() => {
    setLruRoutes(getLRURoutes());
    setFavRoutes(getFavRoutes());
  }, []);

  // 최근 경로 삭제 (연동된 즐겨찾기도 자동 제거)
  const removeLRU = useCallback((routeId) => {
    removeFromLRU(routeId);
    refresh();
  }, [refresh]);

  // 즐겨찾기 토글
  // 추가: 최근 경로 데이터를 즐겨찾기로 복사 저장
  // 취소: 즐겨찾기에서 제거, 최근 경로 별 상태 반영
  const toggleFav = useCallback((route) => {
    if (isFavorite(route.id)) removeFromFav(route.id);
    else addToFav(route);
    refresh();
  }, [refresh]);

  // 즐겨찾기 삭제 (좌측 별 상태도 자동 반영)
  const removeFav = useCallback((routeId) => {
    removeFromFav(routeId);
    refresh();
  }, [refresh]);

  return { lruRoutes, favRoutes, removeLRU, toggleFav, removeFav, isFavorite, refresh };
};

export default useRouteList;
