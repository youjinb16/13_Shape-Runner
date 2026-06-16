// =====================================================
// RouteListPage.jsx  ( frontend/src/components/RouteListPage.jsx )
// 0531 창현 - 경로 목록 페이지 (프로토타입 디자인에 맞게 제작)
// 0617 창현 - 수정/추가:
//   - 카드에 SVG 미니맵 썸네일 표시 (RouteThumbnail)
//   - 카드에 "📤 공유하기" 버튼 + 소개글 입력 → 커뮤니티 등록
//   - "🌍 커뮤니티" 탭 추가 (좋아요/다운로드 수, 4종 정렬)
// =====================================================

import { useState } from 'react'
import useRouteList from '../hooks/useRouteList'
import useCommunity from '../hooks/useCommunity' // 0617 창현 - 추가: 커뮤니티 훅
import bgImage from '../assets/Bacjground_img.jpg'
import { exportGPXFile } from '../utils/routeModule'
import RouteThumbnail from './RouteThumbnail' // 0617 창현 - 추가: SVG 미니맵 썸네일
import { SORT_OPTIONS, getMyLocation } from '../utils/communityModule' // 0617 창현 - 추가: 정렬 상수 + 현 위치 조회

const SHAPE_LABELS = { heart: '❤️ Heart', star: '⭐ Star', bone: '🦴 Bone' }

const fmtDist = (km) => {
  if (km == null) return ''
  return km >= 1 ? `${km.toFixed(1)}km` : `${Math.round(km * 1000)}m`
}
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

// ── 단일 경로 카드 ──────────────────────────────────────
// 0617 창현 - 수정: onShare prop 추가 (공유하기 버튼용)
const RouteCard = ({ route, showFavBtn, isFaved, onToggleFav, onDelete, onShare }) => {
  const [confirmDel, setConfirmDel] = useState(false)
  const [confirmDown, setConfirmDown] = useState(false)
  // 0617 창현 - 추가: 공유 입력창 표시 여부 + 소개글 입력 state
  const [shareOpen, setShareOpen] = useState(false)
  const [introText, setIntroText] = useState('')

  // 0531 창현 - 불러오기 → 다운하기: GPX 파일 직접 다운로드
  const handleDownload = () => {
    exportGPXFile(route.coordinates, route.name, route.shape, route.distance)
    setConfirmDown(false)
  }

  // 0617 창현 - 추가: 공유 등록 핸들러 (소개글과 함께 커뮤니티로 전달)
  const handleShare = () => {
    onShare(route, introText)
    setShareOpen(false)
    setIntroText('')
  }

  return (
    <div style={S.card}>
      {/* 0617 창현 - 수정: 썸네일 + 정보를 가로로 배치 */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 0617 창현 - 추가: SVG 미니맵 썸네일 */}
        <RouteThumbnail coordinates={route.coordinates} shape={route.shape} size={84} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={S.shapeBadge}>{SHAPE_LABELS[route.shape] ?? route.shape}</span>
            <span style={S.meta}>{fmtDate(route.exportedAt ?? route.createdAt)}</span>
          </div>
          <p style={S.routeName}>{route.name}</p>
          {route.distance && <p style={S.meta}>{fmtDist(route.distance)}</p>}
        </div>
      </div>

      {/* 0531 창현 - 다운하기 확인 알림 */}
      {confirmDown && (
        <div style={S.confirmBox}>
          <p style={S.confirmText}>GPX 파일을 다운로드하시겠습니까?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnConfirmOk} onClick={handleDownload}>확인</button>
            <button style={S.btnConfirmCancel} onClick={() => setConfirmDown(false)}>취소</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={S.confirmDelBox}>
          <p style={{ ...S.confirmText, color: '#c0392b' }}>이 경로를 삭제하시겠습니까?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnDelOk} onClick={() => { onDelete(route.id); setConfirmDel(false) }}>삭제</button>
            <button style={S.btnConfirmCancel} onClick={() => setConfirmDel(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 0617 창현 - 추가: 공유 소개글 입력창 */}
      {shareOpen && (
        <div style={S.shareBox}>
          <p style={S.shareTitle}>📤 커뮤니티에 이 코스를 공유</p>
          <textarea
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="이 코스를 소개해주세요! (예: 한강변이라 평탄하고 야경이 좋아요)"
            style={S.shareTextarea}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={S.btnConfirmOk} onClick={handleShare}>공유하기</button>
            <button style={S.btnConfirmCancel} onClick={() => { setShareOpen(false); setIntroText('') }}>취소</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* 0531 창현 - 다운하기 버튼: GPX 파일 다운로드 */}
        <button style={S.btnLoad} onClick={() => setConfirmDown(true)}>⬇ 다운하기</button>
        {/* 0617 창현 - 추가: 공유하기 버튼 (커뮤니티 등록) */}
        <button style={S.btnShare} onClick={() => setShareOpen((v) => !v)}>📤 공유하기</button>
        {showFavBtn && (
          <button
            style={{ ...S.btnIcon, color: isFaved ? '#f0a500' : '#ccc' }}
            onClick={() => onToggleFav(route)}
            title={isFaved ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {isFaved ? '★' : '☆'}
          </button>
        )}
        <button style={{ ...S.btnIcon, color: '#bbb' }} onClick={() => setConfirmDel(true)} title="삭제">🗑</button>
      </div>
    </div>
  )
}

// ── 커뮤니티 게시물 카드 ──────────────────────────────────
// 0617 창현 - 추가: 커뮤니티 전용 카드 (좋아요/다운로드 수, 작성자, 소개글 표시)
const CommunityCard = ({ post, liked, onLike, onDownload, onDelete }) => {
  const [confirmDown, setConfirmDown] = useState(false)
  // 0617 창현 - 추가: 커뮤니티 글 삭제 확인창 표시 state (최근/즐겨찾기와 동일한 UX)
  const [confirmDel, setConfirmDel] = useState(false)

  // 0617 창현 - 추가: 커뮤니티 코스 다운로드 → GPX 저장 + 다운로드 수 증가
  const handleDownload = () => {
    exportGPXFile(post.coordinates, post.name, post.shape, post.distance)
    onDownload(post.id)
    setConfirmDown(false)
  }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 0617 창현 - 추가: 썸네일 */}
        <RouteThumbnail coordinates={post.coordinates} shape={post.shape} size={84} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={S.shapeBadge}>{SHAPE_LABELS[post.shape] ?? post.shape}</span>
            <span style={S.meta}>{fmtDate(post.createdAt)}</span>
          </div>
          <p style={S.routeName}>{post.name}</p>
          {/* 0617 창현 - 추가: 작성자 + 거리 (내 글이면 '나' 강조 배지) */}
          <p style={S.meta}>
            👤 {post.author}{post.isMine ? ' 🟢(내 코스)' : ''}{post.distance ? ` · ${fmtDist(post.distance)}` : ''}
          </p>
        </div>
      </div>

      {/* 0617 창현 - 추가: 소개글 */}
      {post.intro && <p style={S.introText}>{post.intro}</p>}

      {/* 0617 창현 - 추가: 좋아요/다운로드 통계 + 액션 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          style={{ ...S.btnStat, color: liked ? '#e8506e' : '#999', borderColor: liked ? '#f5c6d0' : '#e0e0e0' }}
          onClick={() => onLike(post.id)}
        >
          {liked ? '❤️' : '🤍'} {post.likes}
        </button>
        <span style={S.statDownload}>⬇ {post.downloads}</span>
        <button style={S.btnLoad} onClick={() => setConfirmDown(true)}>⬇ 다운받기</button>
        {/* 0617 창현 - 수정: 내가 올린 글만 삭제 가능 (community_ 접두사)
            기존엔 클릭 즉시 삭제됐으나, 확인창을 거치도록 변경 */}
        {post.id.startsWith('community_') && (
          <button style={{ ...S.btnIcon, color: '#bbb' }} onClick={() => setConfirmDel(true)} title="삭제">🗑</button>
        )}
      </div>

      {/* 0617 창현 - 추가: 다운로드 확인 알림 */}
      {confirmDown && (
        <div style={S.confirmBox}>
          <p style={S.confirmText}>이 코스를 GPX로 다운로드하시겠습니까?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnConfirmOk} onClick={handleDownload}>확인</button>
            <button style={S.btnConfirmCancel} onClick={() => setConfirmDown(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 0617 창현 - 추가: 커뮤니티 글 삭제 확인 알림 (최근/즐겨찾기 삭제 UX와 통일) */}
      {confirmDel && (
        <div style={S.confirmDelBox}>
          <p style={{ ...S.confirmText, color: '#c0392b' }}>커뮤니티에서 이 코스를 삭제하시겠습니까?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnDelOk} onClick={() => { onDelete(post.id); setConfirmDel(false) }}>삭제</button>
            <button style={S.btnConfirmCancel} onClick={() => setConfirmDel(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 메인 페이지 컴포넌트 ────────────────────────────────
// 0617 창현 - 수정: myLocation을 prop이 아닌 저장소(getMyLocation)에서 직접 읽음
//            (새 React Router 구조에서 startPoint가 다른 페이지에 격리되어 있어,
//             GPX 저장 시 기록해 둔 마지막 시작점을 '현 위치'로 사용)
//            0617 창현 - 정리: 사용되지 않던 onLoadRoute prop 제거
const RouteListPage = ({ onBack, initialTab }) => {
  const [tab, setTab] = useState(initialTab ?? 'recent')
  const { lruRoutes, favRoutes, removeLRU, toggleFav, removeFav, isFavorite } = useRouteList()
  // 0617 창현 - 추가: 저장된 '현 위치'(마지막 시작점)를 커뮤니티 가까운 순 정렬 기준으로 사용
  const myLocation = getMyLocation()
  // 0617 창현 - 재작성: 커뮤니티 훅 하나로 전체/내글/좋아요 세 목록을 함께 관리
  //            (기존엔 훅을 2개 따로 띄워 좋아요가 서로 반영 안 되던 문제 → 단일 소스로 통합)
  const {
    allPosts, minePosts, likedPosts,
    allSort, mineSort, likedSort,
    setAllSort, setMineSort, setLikedSort,
    share, like, isLiked, download, removePost,
  } = useCommunity(myLocation)

  // 0617 창현 - 수정: 커뮤니티 하위 보기 전환 ('all' 전체 / 'mine' 내가 올린 / 'liked' 내가 좋아하는)
  const [communityView, setCommunityView] = useState('all')

  // 0617 창현 - 추가: 공유 완료 토스트 표시 state
  const [shareToast, setShareToast] = useState(false)

  // 0617 창현 - 수정: 카드 공유 시 → 커뮤니티 등록 (share가 세 목록 동시 갱신) + 토스트
  const handleShare = (route, intro) => {
    share(route, intro)
    setShareToast(true)
    setTimeout(() => setShareToast(false), 1800)
  }

  // 0617 창현 - 추가: 정렬 옵션 라벨 정의
  const SORT_LABELS = [
    { key: SORT_OPTIONS.LATEST, label: '🕐 최신순' },
    { key: SORT_OPTIONS.NEAREST, label: '📍 가까운 순' },
    { key: SORT_OPTIONS.LIKES, label: '❤️ 좋아요순' },
    { key: SORT_OPTIONS.DOWNLOADS, label: '⬇ 다운로드순' },
  ]

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        overflow: 'auto',
        // 0617 창현 - 수정: 스크롤바가 생겨도 가로 정렬이 흔들리지 않도록 항상 스크롤바 공간 확보
        //            (탭마다 목록 길이가 달라 스크롤바 유무가 바뀌면 화면이 옆으로 치우치던 문제 해결)
        scrollbarGutter: 'stable',
      }}
    >
      <div style={S.container}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, color: 'black', fontSize: 22 }}>🗺️ Shape Runner ✨</h1>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>경로 목록</p>
          </div>
          <button style={S.btnBack} onClick={onBack}>← 돌아가기</button>
        </div>

        {/* 탭 버튼 */}
        {/* 0617 창현 - 수정: 커뮤니티 탭 추가 (총 3개 탭) */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <button
            style={{ ...S.tabBtn, ...(tab === 'recent' ? S.tabActive : {}) }}
            onClick={() => setTab('recent')}
          >
            🕐 최근 생성 경로
          </button>
          <button
            style={{ ...S.tabBtn, ...(tab === 'fav' ? S.tabActive : {}) }}
            onClick={() => setTab('fav')}
          >
            ⭐ 즐겨찾는 경로
          </button>
          {/* 0617 창현 - 추가: 커뮤니티 탭 */}
          <button
            style={{ ...S.tabBtn, ...(tab === 'community' ? S.tabActive : {}) }}
            onClick={() => setTab('community')}
          >
            🌍 커뮤니티
          </button>
        </div>

        {/* 최근 경로 탭 */}
        {tab === 'recent' && (
          <>
            <p style={S.sectionLabel}>
              최근 생성 경로
              {/* 0617 창현 - 수정: 배지 표기 최대 3개 → 10개 */}
              <span style={S.badge}>LRU · 최대 10개</span>
            </p>
            {lruRoutes.length === 0
              ? <p style={S.empty}>Export GPX 시 자동으로 기록됩니다</p>
              : lruRoutes.map(r => (
                <RouteCard
                  key={r.id} route={r}
                  showFavBtn={true} isFaved={isFavorite(r.id)}
                  onToggleFav={toggleFav} onDelete={removeLRU}
                  onShare={handleShare}
                />
              ))
            }
          </>
        )}

        {/* 즐겨찾기 탭 */}
        {tab === 'fav' && (
          <>
            <p style={S.sectionLabel}>
              즐겨찾는 경로
              <span style={S.badge}>{favRoutes.length}개</span>
            </p>
            {favRoutes.length === 0
              ? <p style={S.empty}>{'최근 경로에서 ☆를 눌러 추가하세요'}</p>
              : favRoutes.map(f => (
                <RouteCard
                  key={f.id} route={f}
                  showFavBtn={false} isFaved={false}
                  onToggleFav={null} onDelete={removeFav}
                  onShare={handleShare}
                />
              ))
            }
          </>
        )}

        {/* 0617 창현 - 추가: 커뮤니티 탭 */}
        {tab === 'community' && (
          <>
            {/* 0617 창현 - 수정: 커뮤니티 하위 보기 토글 (전체 / 내가 올린 / 내가 좋아하는) */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setCommunityView('all')}
                style={{ ...S.subTabBtn, ...(communityView === 'all' ? S.subTabActive : {}) }}
              >
                🌍 전체 코스
              </button>
              <button
                onClick={() => setCommunityView('mine')}
                style={{ ...S.subTabBtn, ...(communityView === 'mine' ? S.subTabActive : {}) }}
              >
                🙋 내가 올린 코스
              </button>
              {/* 0617 창현 - 추가: 내가 좋아하는 코스 보기 토글 */}
              <button
                onClick={() => setCommunityView('liked')}
                style={{ ...S.subTabBtn, ...(communityView === 'liked' ? S.subTabActive : {}) }}
              >
                ❤️ 내가 좋아하는 코스
              </button>
            </div>

            {/* ===== 0617 창현 - 추가: 전체 코스 보기 ===== */}
            {communityView === 'all' && (
              <>
                <p style={S.sectionLabel}>
                  커뮤니티 공유 코스
                  <span style={S.badge}>{allPosts.length}개</span>
                </p>

                {/* 0617 창현 - 추가: 정렬 선택 버튼들 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  {SORT_LABELS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setAllSort(key)}
                      style={{ ...S.sortBtn, ...(allSort === key ? S.sortBtnActive : {}) }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 0617 창현 - 추가: '가까운 순' 안내 (프로토타입 기준 설명) */}
                {allSort === SORT_OPTIONS.NEAREST && (
                  <p style={S.nearestNote}>
                    ※ 프로토타입에서는 지도에서 마지막으로 클릭한 시작 지점을 '현 위치'로 사용합니다.
                    (실제 배포 시 GPS 기반 실제 위치로 정렬됩니다)
                  </p>
                )}

                {allPosts.length === 0
                  ? <p style={S.empty}>최근 경로/즐겨찾기에서 📤 공유하기를 눌러 코스를 올려보세요</p>
                  : allPosts.map(p => (
                    <CommunityCard
                      key={p.id} post={p}
                      liked={isLiked(p.id)}
                      onLike={like} onDownload={download} onDelete={removePost}
                    />
                  ))
                }
              </>
            )}

            {/* ===== 0617 창현 - 추가: 내가 올린 코스만 보기 ===== */}
            {communityView === 'mine' && (
              <>
                <p style={S.sectionLabel}>
                  내가 올린 코스
                  <span style={S.badge}>{minePosts.length}개</span>
                </p>

                {/* 0617 창현 - 추가: 내 글 목록 정렬 버튼들 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  {SORT_LABELS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setMineSort(key)}
                      style={{ ...S.sortBtn, ...(mineSort === key ? S.sortBtnActive : {}) }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {mineSort === SORT_OPTIONS.NEAREST && (
                  <p style={S.nearestNote}>
                    ※ 프로토타입에서는 지도에서 마지막으로 클릭한 시작 지점을 '현 위치'로 사용합니다.
                    (실제 배포 시 GPS 기반 실제 위치로 정렬됩니다)
                  </p>
                )}

                {minePosts.length === 0
                  ? <p style={S.empty}>아직 커뮤니티에 올린 코스가 없어요. 최근 경로/즐겨찾기에서 📤 공유해보세요</p>
                  : minePosts.map(p => (
                    <CommunityCard
                      key={p.id} post={p}
                      liked={isLiked(p.id)}
                      onLike={like} onDownload={download} onDelete={removePost}
                    />
                  ))
                }
              </>
            )}

            {/* ===== 0617 창현 - 추가: 내가 좋아하는 코스 보기 ===== */}
            {communityView === 'liked' && (
              <>
                <p style={S.sectionLabel}>
                  내가 좋아하는 코스
                  <span style={S.badge}>{likedPosts.length}개</span>
                </p>

                {/* 0617 창현 - 추가: 좋아요 목록 정렬 버튼들 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  {SORT_LABELS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setLikedSort(key)}
                      style={{ ...S.sortBtn, ...(likedSort === key ? S.sortBtnActive : {}) }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {likedSort === SORT_OPTIONS.NEAREST && (
                  <p style={S.nearestNote}>
                    ※ 프로토타입에서는 지도에서 마지막으로 클릭한 시작 지점을 '현 위치'로 사용합니다.
                    (실제 배포 시 GPS 기반 실제 위치로 정렬됩니다)
                  </p>
                )}

                {likedPosts.length === 0
                  ? <p style={S.empty}>아직 좋아요한 코스가 없어요. 커뮤니티에서 🤍를 눌러 마음에 드는 코스를 모아보세요</p>
                  : likedPosts.map(p => (
                    <CommunityCard
                      key={p.id} post={p}
                      liked={isLiked(p.id)}
                      onLike={like} onDownload={download} onDelete={removePost}
                    />
                  ))
                }
              </>
            )}
          </>
        )}
      </div>

      {/* 0617 창현 - 추가: 공유 완료 토스트 */}
      {shareToast && (
        <div style={S.toast}>
          ✅ 커뮤니티에 공유했어요! 🌍 커뮤니티 탭에서 확인하세요
        </div>
      )}
    </div>
  )
}

// ── 스타일 (프로토타입 디자인 기준) ─────────────────────
const S = {
  container: {
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(4px)',
    borderRadius: '20px',
    margin: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  btnBack: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: '1.5px solid #189b81',
    background: 'white',
    color: '#189b81',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    background: 'white',
    color: '#444',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    backgroundColor: '#189b81',
    color: 'white',
    border: '1px solid #189b81',
  },
  sectionLabel: {
    fontSize: '12px',
    color: '#999',
    fontWeight: '600',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badge: {
    fontSize: '10px',
    background: '#e8f5ee',
    color: '#189b81',
    borderRadius: '4px',
    padding: '2px 7px',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: '13px',
    padding: '28px 0',
  },
  card: {
    background: 'white',
    border: '1px solid #e5e4e7',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  shapeBadge: {
    fontSize: '11px',
    background: '#e8f5ee',
    color: '#189b81',
    borderRadius: '5px',
    padding: '2px 8px',
    fontWeight: '700',
  },
  routeName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#08060d',
    margin: '0 0 2px',
  },
  meta: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  confirmBox: {
    background: '#fffbe6',
    border: '1px solid #ffe58f',
    borderRadius: '8px',
    padding: '10px 12px',
    margin: '8px 0',
  },
  confirmDelBox: {
    background: '#fff2f2',
    border: '1px solid #ffc5c5',
    borderRadius: '8px',
    padding: '10px 12px',
    margin: '8px 0',
  },
  confirmText: {
    fontSize: '13px',
    color: '#7c5800',
    margin: '0 0 8px',
    fontWeight: '600',
  },
  btnConfirmOk: {
    padding: '5px 16px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#189b81',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
  },
  btnDelOk: {
    padding: '5px 16px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#e74c3c',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
  },
  btnConfirmCancel: {
    padding: '5px 16px',
    borderRadius: '7px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#444',
    cursor: 'pointer',
    fontSize: '13px',
  },
  btnLoad: {
    padding: '5px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#189b81',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
  },
  // 0617 창현 - 추가: 공유하기 버튼 스타일
  btnShare: {
    padding: '5px 14px',
    borderRadius: '7px',
    border: '1px solid #189b81',
    backgroundColor: 'white',
    color: '#189b81',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
  },
  // 0617 창현 - 추가: 공유 소개글 입력 박스
  shareBox: {
    background: '#f0faf7',
    border: '1px solid #b2e0d8',
    borderRadius: '8px',
    padding: '12px',
    margin: '10px 0',
  },
  // 0617 창현 - 추가: 공유 박스 제목
  shareTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#189b81',
    margin: '0 0 8px',
  },
  // 0617 창현 - 추가: 소개글 textarea
  shareTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cce5df',
    borderRadius: '7px',
    padding: '8px 10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },
  // 0617 창현 - 추가: 커뮤니티 소개글 표시
  introText: {
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.5,
    margin: '10px 0 0',
    padding: '8px 10px',
    background: '#fafafa',
    borderRadius: '7px',
  },
  // 0617 창현 - 추가: 좋아요 버튼 (통계 겸용)
  btnStat: {
    padding: '5px 12px',
    borderRadius: '7px',
    border: '1px solid #e0e0e0',
    backgroundColor: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.15s ease',
  },
  // 0617 창현 - 추가: 다운로드 수 표시 (텍스트)
  statDownload: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '600',
    padding: '0 4px',
  },
  // 0617 창현 - 추가: 정렬 버튼
  sortBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    background: 'white',
    color: '#666',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  // 0617 창현 - 추가: 활성 정렬 버튼
  sortBtnActive: {
    backgroundColor: '#189b81',
    color: 'white',
    border: '1px solid #189b81',
  },
  // 0617 창현 - 추가: 커뮤니티 하위 토글 버튼 (전체/내 글)
  subTabBtn: {
    flex: 1,
    padding: '9px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    background: 'white',
    color: '#666',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  // 0617 창현 - 추가: 활성 하위 토글 버튼
  subTabActive: {
    backgroundColor: '#eaf6f2',
    color: '#189b81',
    border: '1.5px solid #189b81',
  },
  // 0617 창현 - 추가: 가까운 순 안내 문구
  nearestNote: {
    fontSize: '11px',
    color: '#999',
    background: '#f7f7f7',
    borderRadius: '7px',
    padding: '8px 10px',
    margin: '0 0 12px',
    lineHeight: 1.5,
  },
  // 0617 창현 - 추가: 공유 완료 토스트
  toast: {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.82)',
    color: 'white',
    padding: '12px 22px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  btnIcon: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 2px',
  },
}

export default RouteListPage
