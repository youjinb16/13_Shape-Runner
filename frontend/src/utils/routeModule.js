// =====================================================
// routeModule.js  ( frontend/src/utils/routeModule.js )
//
// 경로 목록 모듈의 핵심 로직 전체
// - LRU Cache 기반 최근 경로 관리
// - 즐겨찾기 저장 및 조회
// - GPX 파일 내보내기
// =====================================================

const STORAGE_KEY_LRU = 'shapeRunner_lruRoutes';
const STORAGE_KEY_FAV = 'shapeRunner_favRoutes';
// 0617 창현 - 수정: 최근 경로 최대 저장 개수를 3개 → 10개로 확대
//            (기존 LRU_MAX = 3 에서 변경. 사용자가 더 많은 최근 경로를 참고할 수 있도록 함)
const LRU_MAX = 10;


// =====================================================
// 1. LRU Cache ( routeModule.js )
// =====================================================

// 1-1) LRUCache 클래스
//
// 역할: GPX 내보내기 이력을 최대 10개까지 자동 관리
//       (0617 창현 - 수정: 기존 최대 3개 → 10개로 확대)
//
// 사용 알고리즘: LRU Cache (Least Recently Used)
// 최근에 GPX를 내보낸 경로를 상단에 유지하고,
// 10개를 초과하면 가장 오래된 항목을 자동 제거한다.
// 캐시 교체 정책 중 가장 직관적이고 러닝 앱 특성상
// 최근 경로를 빠르게 재사용하는 패턴에 적합해 선택했다.
//
// 사용 자료구조:
// 1) 이중 연결 리스트(Doubly Linked List): LRUNode.prev / LRUNode.next
//    최근 접근 순서를 유지하며 head/tail 포인터로 O(1) 삽입·삭제 가능.
//    단방향 리스트는 이전 노드 접근이 O(n)이라 양방향 리스트를 선택했다.
// 2) 해시맵(Map): this.map = new Map()
//    routeId → LRUNode 매핑으로 O(1) 탐색 가능.
//    두 자료구조를 조합해 탐색·삽입·삭제 모두 O(1)을 달성한다.

class LRUNode {
  constructor(route) {
    this.route = route;
    this.prev  = null; // 이중 연결 리스트: 이전 노드 포인터
    this.next  = null; // 이중 연결 리스트: 다음 노드 포인터
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map  = new Map(); // 자료구조: 해시맵 - routeId → LRUNode
    this.head = null;      // 가장 최근 접근 노드
    this.tail = null;      // 가장 오래된 노드
  }

  // 맨 앞(head)에 노드 삽입
  _addToHead(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  // 노드 제거
  _removeNode(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  // 알고리즘: LRU Cache - put()
  // 이미 있으면 맨 앞으로 이동, 없으면 삽입 후 초과 시 tail 제거
  put(route) {
    if (this.map.has(route.id)) {
      const node = this.map.get(route.id);
      node.route = route;
      this._removeNode(node);
      this._addToHead(node);
    } else {
      const node = new LRUNode(route);
      this.map.set(route.id, node);
      this._addToHead(node);
      if (this.map.size > this.capacity) {
        this.map.delete(this.tail.route.id);
        this._removeNode(this.tail);
      }
    }
    this._persist();
  }

  remove(routeId) {
    if (!this.map.has(routeId)) return;
    const node = this.map.get(routeId);
    this._removeNode(node);
    this.map.delete(routeId);
    this._persist();
  }

  // 전체 목록 반환 (최신순)
  getAll() {
    const result = [];
    let cur = this.head;
    while (cur) { result.push(cur.route); cur = cur.next; }
    return result;
  }

  // 알고리즘: 직렬화(Serialization) - 리스트 순서 유지하여 JSON 저장
  _persist() {
    localStorage.setItem(STORAGE_KEY_LRU, JSON.stringify(this.getAll()));
  }

  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LRU);
      if (!raw) return;
      [...JSON.parse(raw)].reverse().forEach(r => this.put(r));
    } catch { /* 복원 실패 시 빈 상태로 시작 */ }
  }
}

// 싱글턴 인스턴스 (앱 실행 시 1회 복원)
const lruCache = new LRUCache(LRU_MAX);
lruCache.restore();

// LRU 공개 API
export const addToLRU    = (route)    => lruCache.put(route);
export const getLRURoutes = ()        => lruCache.getAll();
export const removeFromLRU = (routeId) => {
  lruCache.remove(routeId);
  // 연동된 즐겨찾기도 제거
  const map = _loadFav();
  if (map.has(routeId)) { map.delete(routeId); _saveFav(map); }
};


// =====================================================
// 2. 즐겨찾기 저장소 ( routeModule.js )
// =====================================================

// 2-1) 즐겨찾기 저장 및 조회
//
// 역할: 사용자가 ☆ 버튼으로 지정한 경로를 영속 저장하고 조회
//
// 사용 자료구조: 해시맵(Map) - _loadFav()
//   routeId를 key로 사용해 O(1) 접근·삽입·삭제 가능.
//   최근 경로(LRU)의 id를 그대로 key로 공유하여
//   즐겨찾기 여부를 O(1)로 확인하고 양방향 연동이 가능하다.
//
// 사용 알고리즘: 직렬화(Serialization) - _saveFav()
//   Map 객체는 JSON.stringify 직접 변환이 불가능하므로
//   entries() 배열로 변환 후 저장하고, 복원 시 new Map()으로 재구성한다.

const _loadFav = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAV);
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch { return new Map(); }
};

// 알고리즘: 직렬화(Serialization) - Map → JSON 변환
const _saveFav = (map) => {
  localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify([...map.entries()]));
};

export const addToFav = (route) => {
  const map = _loadFav();
  map.set(route.id, { ...route, createdAt: Date.now() });
  _saveFav(map);
};

export const removeFromFav = (routeId) => {
  const map = _loadFav();
  map.delete(routeId);
  _saveFav(map);
};

export const isFavorite = (routeId) => _loadFav().has(routeId);

// 2-2) getFavRoutes()
//
// 역할: 즐겨찾기 목록을 최신 추가 순으로 반환
//
// 사용 알고리즘: 정렬(Sort)
//   즐겨찾기는 추가된 시간(createdAt) 기준 내림차순 정렬.
//   최근에 추가한 항목을 상단에 표시하는 것이 사용자 경험상 자연스럽고,
//   배열 sort()로 간단히 구현 가능해 선택했다.
export const getFavRoutes = () => {
  const routes = [..._loadFav().values()];
  // 알고리즘: 정렬(Sort) - 최신 추가 순
  return routes.sort((a, b) => b.createdAt - a.createdAt);
};


// =====================================================
// 3. GPX 내보내기 ( routeModule.js )
// =====================================================

// 3-1) exportGPXFile()
//
// 역할: 생성된 경로 좌표를 GPX 파일로 변환 후 다운로드
//       동시에 최근 경로(LRU Cache)에 자동 추가
//
// 사용 알고리즘: XML 직렬화(Serialization)
//   좌표 배열을 GPX 표준 XML 포맷으로 변환한다.
//   카카오맵 등 외부 서비스에서 불러올 수 있는
//   표준 GPS 포맷 지원이 필요했기 때문에 선택했다.
//
// 사용 자료구조: 배열(Array) - coordinates.map()
//   좌표 데이터를 순차적으로 순회하며 XML 태그로 변환하기 위해 사용했다.
//
// ※ shape, distance 파라미터는
//    조장 코드의 실제 변수명으로 연결 필요 (TODO)

export const exportGPXFile = (coordinates, name = '경로', shape, distance) => {
  // 알고리즘: XML 직렬화(Serialization) - 좌표 배열 → GPX XML 변환
  const trackPoints = coordinates
    .map(([lat, lng]) => `    <trkpt lat="${lat}" lon="${lng}"></trkpt>`)
    .join('\n');

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Shape-Runner"
  xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${name}.gpx`;
  a.click();
  URL.revokeObjectURL(url);

  // 알고리즘: LRU Cache - GPX 내보내기 시 최근 경로 자동 추가
  addToLRU({
    id:         `route_${Date.now()}`,
    name,
    shape:      shape ?? 'unknown',
    coordinates,
    distance:   distance ?? null,
    exportedAt: Date.now(),
  });
};
