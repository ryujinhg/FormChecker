// バージョン番号だけ毎回変更
const CACHE_NAME = 'formchecker-cache-v2.1.8';

const FILES_TO_CACHE = [
  './',
  './manifest.json'
];

// インストール
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 古いキャッシュ削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      ),
      self.clients.claim()
    ])
  );
});

// Fetch
self.addEventListener('fetch', (event) => {

  // HTMLだけは常に最新を取りに行く
  if (event.request.mode === 'navigate') {

    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match('./'))
    );

    return;
  }

  // それ以外はキャッシュ優先
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
