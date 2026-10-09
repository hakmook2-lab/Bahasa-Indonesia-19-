// 오프라인 실행용 서비스워커: 한 번 열면 인터넷 없이도 앱이 열림
// ※ 같은 주소(github.io 등)에 다른 앱(골프 스코어 등)이 있어도, 이 앱의 캐시만 정리함
const PREFIX = 'belajar-yuk-private-';
const CACHE = PREFIX + 'v13';
const FILES = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 네트워크 우선(새 버전 즉시 반영), 오프라인이면 캐시로 실행
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 오디오(mp3)는 브라우저가 직접 받게 둠 — 구간 요청(Range)을 서비스워커가 가로채면 아이폰에서 재생이 깨질 수 있음
  if (/\.mp3(\?|$)/.test(e.request.url) || e.request.headers.has('range')) return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
