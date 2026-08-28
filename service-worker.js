// ↓ 変更前が v1 だったら、v2 や v1.0.1 などに変更する
const CACHE_NAME = 'formchecker-cache-v2.1.1';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時に新しいキャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // 新しいSWをすぐに有効化させる
  self.skipWaiting();
});

// 古いキャッシュを削除する処理（これを書かないと古いキャッシュが残り続けます）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
