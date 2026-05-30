// =====================================================
// RouteListPage.jsx  ( frontend/src/components/RouteListPage.jsx )
// 0531 창현 - 경로 목록 페이지 (프로토타입 디자인에 맞게 제작)
// =====================================================

import { useState } from 'react'
import useRouteList from '../hooks/useRouteList'
import bgImage from '../assets/Bacjground_img.jpg'
import { exportGPXFile } from '../utils/routeModule'

const SHAPE_LABELS = { heart: '❤️ Heart', star: '⭐ Star', bone: '🦴 Bone' }

const fmtDist = (km) => {
  if (km == null) return ''
  return km >= 1 ? `${km.toFixed(1)}km` : `${Math.round(km * 1000)}m`
}
const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

// ── 단일 경로 카드 ──────────────────────────────────────
const RouteCard = ({ route, showFavBtn, isFaved, onToggleFav, onDelete }) => {
  const [confirmDel, setConfirmDel] = useState(false)
  const [confirmDown, setConfirmDown] = useState(false)

  // 0531 창현 - 불러오기 → 다운하기: GPX 파일 직접 다운로드
  const handleDownload = () => {
    exportGPXFile(route.coordinates, route.name, route.shape, route.distance)
    setConfirmDown(false)
  }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={S.shapeBadge}>{SHAPE_LABELS[route.shape] ?? route.shape}</span>
        <span style={S.meta}>{fmtDate(route.exportedAt ?? route.createdAt)}</span>
      </div>
      <p style={S.routeName}>{route.name}</p>
      {route.distance && <p style={S.meta}>{fmtDist(route.distance)}</p>}

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

      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
        {/* 0531 창현 - 다운하기 버튼: GPX 파일 다운로드 */}
        <button style={S.btnLoad} onClick={() => setConfirmDown(true)}>⬇ 다운하기</button>
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

// ── 메인 페이지 컴포넌트 ────────────────────────────────
const RouteListPage = ({ onBack, onLoadRoute, initialTab }) => {
  const [tab, setTab] = useState(initialTab ?? 'recent')
  const { lruRoutes, favRoutes, removeLRU, toggleFav, removeFav, isFavorite } = useRouteList()

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
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
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
        </div>

        {/* 최근 경로 탭 */}
        {tab === 'recent' && (
          <>
            <p style={S.sectionLabel}>
              최근 생성 경로
              <span style={S.badge}>LRU · 최대 3개</span>
            </p>
            {lruRoutes.length === 0
              ? <p style={S.empty}>Export GPX 시 자동으로 기록됩니다</p>
              : lruRoutes.map(r => (
                <RouteCard
                  key={r.id} route={r}
                  showFavBtn={true} isFaved={isFavorite(r.id)}
                  onToggleFav={toggleFav} onDelete={removeLRU}
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
                />
              ))
            }
          </>
        )}
      </div>
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
  btnIcon: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 2px',
  },
}

export default RouteListPage
