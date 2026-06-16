// =====================================================
// communityModule.js  ( frontend/src/utils/communityModule.js )
// 0617 창현 - 추가: 커뮤니티(러닝 코스 공유) 저장소 및 로직 신규 생성
//
// 역할:
//   사용자가 최근 경로/즐겨찾기에서 "공유하기"로 올린 러닝 코스를
//   커뮤니티 목록으로 모아 보여주고, 좋아요·다운로드 수를 관리하며
//   여러 기준으로 정렬한다. (SNS 느낌의 코스 공유 게시판)
//
// 구현 방식 (B안 - 로컬 시뮬레이션):
//   실제 SNS는 모든 사용자의 게시물을 한 곳에 모으는 공용 서버 DB가 필요하다.
//   본 프로토타입은 중앙 DB 없이 localStorage로 "커뮤니티가 있는 것처럼" 동작한다.
//   - 미리 깔아둔 샘플 코스 + 내가 올린 코스가 한 목록에 함께 표시된다.
//   - 좋아요/다운로드 카운트, 4가지 정렬 모두 실제로 동작한다.
//   - 단, 같은 브라우저 안에서만 공유된다 (다른 기기와는 공유 안 됨).
//   ※ 실제 배포 단계에서는 이 모듈의 저장/조회를 서버 API 호출로 교체하면
//     동일한 UI로 진짜 SNS 공유가 가능하다.
//
// 사용 자료구조: 배열(Array) - 게시물 목록을 순회/정렬하기 위해 사용
// 사용 알고리즘: 정렬(Sort) - 최신순/거리순/좋아요순/다운로드순 4종
// =====================================================

const STORAGE_KEY_COMMUNITY = 'shapeRunner_communityPosts'
const STORAGE_KEY_LIKED = 'shapeRunner_communityLiked' // 0617 창현 - 추가: 내가 좋아요한 글 id 집합
const STORAGE_KEY_MYLOC = 'shapeRunner_myLocation' // 0617 창현 - 추가: 마지막 시작점(현 위치 대체)

// =====================================================
// 0617 창현 - 추가: '현 위치' 좌표 저장/조회
//   페이지가 분리(React Router)되어 있어 RouteGeneratorPage의 startPoint가
//   커뮤니티 페이지로 직접 전달되지 않으므로, GPX 저장 시점의 시작점을
//   localStorage에 기록해 두고 커뮤니티 '가까운 순' 정렬의 기준점으로 사용한다.
//   ※ 실제 배포 단계에서는 navigator.geolocation의 실제 GPS 좌표로 대체된다.
// =====================================================
export const saveMyLocation = (latlng) => {
  if (!latlng) return
  localStorage.setItem(STORAGE_KEY_MYLOC, JSON.stringify(latlng))
}

export const getMyLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MYLOC)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// 0617 창현 - 추가: 정렬 기준 상수 (UI 드롭다운과 공유)
export const SORT_OPTIONS = {
  LATEST: 'latest', // 날짜별 최신순
  NEAREST: 'nearest', // 현 위치에서 가까운 순
  LIKES: 'likes', // 좋아요 순
  DOWNLOADS: 'downloads', // 다운로드 순
}

// =====================================================
// 0617 창현 - 추가: 샘플(미리 깔아둔) 커뮤니티 코스
// 처음 실행 시 빈 화면이 아니라 그럴듯한 목록이 보이도록 시드 데이터를 넣는다.
// 좌표는 서울/성남 일대의 간단한 예시 경로(작은 폐루프)다.
// =====================================================
const SEED_POSTS = [
  {
    id: 'seed_1',
    name: '한강 하트 러닝',
    shape: 'heart',
    distance: 5.2,
    intro: '한강변을 따라 도는 하트 코스예요. 야경이 정말 예쁩니다! 🌃',
    author: '러너Kim',
    coordinates: [
      [37.5172, 127.0286], [37.5180, 127.0300], [37.5185, 127.0315],
      [37.5178, 127.0328], [37.5165, 127.0330], [37.5158, 127.0318],
      [37.5160, 127.0300], [37.5172, 127.0286],
    ],
    likes: 42,
    downloads: 88,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3일 전
  },
  {
    id: 'seed_2',
    name: '올림픽공원 별 코스',
    shape: 'star',
    distance: 7.1,
    intro: '올림픽공원 한 바퀴 별 모양! 평탄해서 초보자도 부담 없어요 ⭐',
    author: '별빛조깅',
    coordinates: [
      [37.5202, 127.1212], [37.5215, 127.1225], [37.5208, 127.1240],
      [37.5220, 127.1250], [37.5205, 127.1255], [37.5195, 127.1242],
      [37.5185, 127.1250], [37.5192, 127.1232], [37.5182, 127.1220],
      [37.5198, 127.1222], [37.5202, 127.1212],
    ],
    likes: 31,
    downloads: 54,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1일 전
  },
  {
    id: 'seed_3',
    name: '탄천 뼈다귀 인터벌',
    shape: 'bone',
    distance: 6.4,
    intro: '탄천 따라 뛰는 뼈다귀 코스. 인터벌 훈련하기 딱 좋아요 🦴💪',
    author: '성남러너',
    coordinates: [
      [37.4105, 127.1015], [37.4120, 127.1010], [37.4135, 127.1020],
      [37.4130, 127.1035], [37.4140, 127.1050], [37.4125, 127.1060],
      [37.4110, 127.1052], [37.4118, 127.1038], [37.4108, 127.1028],
      [37.4105, 127.1015],
    ],
    likes: 18,
    downloads: 27,
    createdAt: Date.now() - 1000 * 60 * 60 * 6, // 6시간 전
  },
]

// =====================================================
// 0617 창현 - 추가: localStorage 로드/저장 헬퍼
// =====================================================

// 0617 창현 - 추가: 커뮤니티 게시물 목록 로드 (없으면 시드 데이터로 초기화)
const _loadPosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMUNITY)
    if (!raw) {
      // 최초 실행: 시드 데이터 저장 후 반환
      localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(SEED_POSTS))
      return [...SEED_POSTS]
    }
    return JSON.parse(raw)
  } catch {
    return [...SEED_POSTS]
  }
}

// 0617 창현 - 추가: 게시물 목록 저장 (직렬화)
const _savePosts = (posts) => {
  localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(posts))
}

// 0617 창현 - 추가: 내가 좋아요한 글 id 집합 로드 (중복 좋아요 방지용)
const _loadLiked = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKED)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

// 0617 창현 - 추가: 좋아요 집합 저장 (Set → 배열 직렬화)
const _saveLiked = (set) => {
  localStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify([...set]))
}

// =====================================================
// 0617 창현 - 추가: 공개 API
// =====================================================

/**
 * 0617 창현 - 추가: 커뮤니티에 새 코스 공유(등록)
 * @param {Object} route - 공유할 경로 객체 (coordinates, shape, distance, name 포함)
 * @param {string} intro - 사용자가 작성한 소개글
 * @param {string} author - 작성자 표시명 (기본 '나')
 */
export const shareToCommunity = (route, intro, author = '나') => {
  const posts = _loadPosts()
  posts.push({
    id: `community_${Date.now()}`,
    name: route.name ?? '내 러닝 코스',
    shape: route.shape ?? 'unknown',
    distance: route.distance ?? null,
    intro: intro ?? '',
    author,
    coordinates: route.coordinates ?? [],
    likes: 0,
    downloads: 0,
    createdAt: Date.now(),
    isMine: true, // 0617 창현 - 추가: 내가 올린 글 표시 (커뮤니티 내 '내 글' 탭 필터용)
  })
  _savePosts(posts)
}

/**
 * 0617 창현 - 추가: 좋아요 토글 (이미 눌렀으면 취소)
 * @param {string} postId
 * @returns {boolean} 토글 후 좋아요 상태 (true=좋아요됨)
 */
export const toggleLike = (postId) => {
  const posts = _loadPosts()
  const liked = _loadLiked()
  const post = posts.find((p) => p.id === postId)
  if (!post) return false

  let nowLiked
  if (liked.has(postId)) {
    // 좋아요 취소
    liked.delete(postId)
    post.likes = Math.max(0, post.likes - 1)
    nowLiked = false
  } else {
    // 좋아요 추가
    liked.add(postId)
    post.likes += 1
    nowLiked = true
  }
  _savePosts(posts)
  _saveLiked(liked)
  return nowLiked
}

// 0617 창현 - 추가: 특정 글을 내가 좋아요했는지 확인
export const isLiked = (postId) => _loadLiked().has(postId)

/**
 * 0617 창현 - 추가: 다운로드 수 1 증가 (카드에서 GPX 다운로드 시 호출)
 * @param {string} postId
 */
export const incrementDownload = (postId) => {
  const posts = _loadPosts()
  const post = posts.find((p) => p.id === postId)
  if (post) {
    post.downloads += 1
    _savePosts(posts)
  }
}

/**
 * 0617 창현 - 추가: 게시물 삭제 (내가 올린 글 정리용)
 * @param {string} postId
 */
export const removeFromCommunity = (postId) => {
  const posts = _loadPosts().filter((p) => p.id !== postId)
  _savePosts(posts)
}

// 0617 창현 - 추가: 두 좌표 간 단순 거리 계산 (정렬용, 단위 무관 상대 비교)
//            정밀 거리가 아니라 '가까운 순' 정렬 비교에만 쓰므로 유클리드로 충분
const _roughDist = (lat1, lng1, lat2, lng2) => {
  const dLat = lat1 - lat2
  const dLng = lng1 - lng2
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

/**
 * 0617 창현 - 추가: 정렬된 커뮤니티 게시물 목록 반환
 *
 * @param {string} sortBy   - SORT_OPTIONS 중 하나
 * @param {Array}  myLocation - [lat, lng] '현 위치' 기준점 (가까운 순 정렬용)
 * @param {string} filter   - 0617 창현 - 수정: 'all' 전체 | 'mine' 내가 올린 글 | 'liked' 내가 좋아요한 글
 *                            (기존 onlyMine 불린 → filter 문자열로 확장)
 *
 * ※ '가까운 순(NEAREST)'의 현 위치 기준:
 *    본 프로토타입은 지도에서 사용자가 마지막으로 클릭한 시작 지점을 '현 위치'로 사용한다.
 *    (B안 - 위치 권한 없이 데모 안정적으로 동작시키기 위함)
 *    실제 배포 타입에서는 navigator.geolocation 기반의
 *    실제 GPS 위치를 기준으로 정렬하도록 교체된다.
 */
export const getCommunityPosts = (sortBy = SORT_OPTIONS.LATEST, myLocation = null, filter = 'all') => {
  let posts = _loadPosts()

  // 0617 창현 - 수정: 보기 필터 (all/mine/liked)
  if (filter === 'mine') {
    // 내가 올린 글만
    posts = posts.filter((p) => p.isMine)
  } else if (filter === 'liked') {
    // 0617 창현 - 추가: 내가 좋아요한 글만 ('내가 좋아하는 코스' 목록용)
    const liked = _loadLiked()
    posts = posts.filter((p) => liked.has(p.id))
  }

  // 알고리즘: 정렬(Sort) - 기준에 따라 분기
  switch (sortBy) {
    case SORT_OPTIONS.LIKES:
      // 좋아요 내림차순
      return posts.sort((a, b) => b.likes - a.likes)

    case SORT_OPTIONS.DOWNLOADS:
      // 다운로드 내림차순
      return posts.sort((a, b) => b.downloads - a.downloads)

    case SORT_OPTIONS.NEAREST:
      // 현 위치에서 가까운 순 (각 코스 시작 좌표 기준)
      if (!myLocation) return posts.sort((a, b) => b.createdAt - a.createdAt)
      return posts.sort((a, b) => {
        const aStart = a.coordinates?.[0]
        const bStart = b.coordinates?.[0]
        if (!aStart) return 1
        if (!bStart) return -1
        const da = _roughDist(myLocation[0], myLocation[1], aStart[0], aStart[1])
        const db = _roughDist(myLocation[0], myLocation[1], bStart[0], bStart[1])
        return da - db
      })

    case SORT_OPTIONS.LATEST:
    default:
      // 최신순 (작성 시간 내림차순)
      return posts.sort((a, b) => b.createdAt - a.createdAt)
  }
}
