// =====================================================
// useCommunity.js  ( frontend/src/hooks/useCommunity.js )
// 0617 창현 - 추가: 커뮤니티 게시물 상태 관리 커스텀 훅 신규 생성
// 0617 창현 - 전면 재작성:
//   기존엔 전체용/내글용 훅을 각각 따로 띄워 서로의 변경을 몰라
//   한쪽에서 좋아요를 눌러도 다른 쪽 화면에 반영되지 않았다.
//   → 단일 훅에서 세 가지 보기(전체/내 글/내가 좋아하는 코스)를 함께 관리하고,
//     어떤 액션(좋아요·다운로드·공유·삭제)이든 세 목록을 동시에 새로고침해
//     연관 데이터가 모든 화면에 즉시 미러링되도록 했다.
//
// communityModule.js의 저장 로직을 React 상태(state)와 연결한다.
// (useRouteList.js와 동일한 패턴 — 모듈 로직 + state 동기화)
// =====================================================

import { useState, useCallback } from 'react'
import {
  getCommunityPosts,
  shareToCommunity,
  toggleLike,
  isLiked,
  incrementDownload,
  removeFromCommunity,
  SORT_OPTIONS,
} from '../utils/communityModule'

/**
 * 0617 창현 - 재작성: 커뮤니티 전체/내글/좋아요 목록을 한 번에 관리하는 훅
 *
 * @param {Array} myLocation - [lat, lng] '현 위치' 기준점 (가까운 순 정렬용)
 * @returns {Object}
 *   - allPosts     {Array}    전체 코스 목록 (allSort 기준 정렬)
 *   - minePosts    {Array}    내가 올린 코스 목록 (mineSort 기준 정렬)
 *   - likedPosts   {Array}    내가 좋아하는 코스 목록 (likedSort 기준 정렬)
 *   - allSort/mineSort/likedSort {string} 각 목록의 현재 정렬 기준
 *   - setAllSort/setMineSort/setLikedSort {Function} 각 목록 정렬 변경
 *   - share        {Function} 새 코스 공유 등록 (세 목록 동시 갱신)
 *   - like         {Function} 좋아요 토글 (세 목록 동시 갱신)
 *   - isLiked      {Function} 좋아요 여부 확인
 *   - download     {Function} 다운로드 수 증가 (세 목록 동시 갱신)
 *   - removePost   {Function} 게시물 삭제 (세 목록 동시 갱신)
 */
const useCommunity = (myLocation = null) => {
  // 0617 창현 - 추가: 세 보기 각각의 정렬 기준 state (기본 최신순)
  const [allSort, setAllSortState] = useState(SORT_OPTIONS.LATEST)
  const [mineSort, setMineSortState] = useState(SORT_OPTIONS.LATEST)
  const [likedSort, setLikedSortState] = useState(SORT_OPTIONS.LATEST)

  // 0617 창현 - 추가: 세 보기 각각의 게시물 목록 state
  const [allPosts, setAllPosts] = useState(() => getCommunityPosts(SORT_OPTIONS.LATEST, myLocation, 'all'))
  const [minePosts, setMinePosts] = useState(() => getCommunityPosts(SORT_OPTIONS.LATEST, myLocation, 'mine'))
  const [likedPosts, setLikedPosts] = useState(() => getCommunityPosts(SORT_OPTIONS.LATEST, myLocation, 'liked'))

  // 0617 창현 - 핵심: 세 목록을 한꺼번에 최신 데이터로 새로고침
  //            어떤 액션이든 이걸 호출하면 전체/내글/좋아요 화면이 동시에 동기화된다.
  //            (각 목록은 자신의 현재 정렬 기준을 유지)
  const refreshAll = useCallback(
    (sorts = {}) => {
      const a = sorts.all ?? allSort
      const m = sorts.mine ?? mineSort
      const l = sorts.liked ?? likedSort
      setAllPosts(getCommunityPosts(a, myLocation, 'all'))
      setMinePosts(getCommunityPosts(m, myLocation, 'mine'))
      setLikedPosts(getCommunityPosts(l, myLocation, 'liked'))
    },
    [allSort, mineSort, likedSort, myLocation]
  )

  // 0617 창현 - 추가: 각 보기의 정렬 변경 (해당 목록만 재정렬)
  const setAllSort = useCallback((sort) => {
    setAllSortState(sort)
    setAllPosts(getCommunityPosts(sort, myLocation, 'all'))
  }, [myLocation])

  const setMineSort = useCallback((sort) => {
    setMineSortState(sort)
    setMinePosts(getCommunityPosts(sort, myLocation, 'mine'))
  }, [myLocation])

  const setLikedSort = useCallback((sort) => {
    setLikedSortState(sort)
    setLikedPosts(getCommunityPosts(sort, myLocation, 'liked'))
  }, [myLocation])

  // 0617 창현 - 추가: 새 코스 공유 → 세 목록 동시 갱신
  const share = useCallback((route, intro, author) => {
    shareToCommunity(route, intro, author)
    refreshAll()
  }, [refreshAll])

  // 0617 창현 - 핵심: 좋아요 토글 → 세 목록 동시 갱신
  //            전체에서 누르든 내 글/좋아요에서 누르든 모든 화면에 즉시 반영되고,
  //            좋아요 해제 시 '내가 좋아하는 코스' 목록에서도 바로 사라진다.
  const like = useCallback((postId) => {
    toggleLike(postId)
    refreshAll()
  }, [refreshAll])

  // 0617 창현 - 추가: 다운로드 수 증가 → 세 목록 동시 갱신
  const download = useCallback((postId) => {
    incrementDownload(postId)
    refreshAll()
  }, [refreshAll])

  // 0617 창현 - 추가: 게시물 삭제 → 세 목록 동시 갱신
  const removePost = useCallback((postId) => {
    removeFromCommunity(postId)
    refreshAll()
  }, [refreshAll])

  return {
    allPosts, minePosts, likedPosts,
    allSort, mineSort, likedSort,
    setAllSort, setMineSort, setLikedSort,
    share, like, isLiked, download, removePost,
  }
}

export default useCommunity
