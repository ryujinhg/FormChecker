// ↓ 今後コードを変更して更新したい時は、この「v1」を「v2」「v3」に変更してください
const CACHE_NAME = 'formchecker-cache-v10';

// キャッシュするファイルの一覧
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// インストール処理（新しいキャッシュを保存して即座に待機解除）
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 新しいService Workerを即座に有効化
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 有効化処理（古いバージョンのキャッシュを自動削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] 古いキャッシュを削除しました:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // すべてのタブ/ページを即座に新しいSWで制御
});

// ネットワーク優先（通信できれば最新を取得し、オフライン時のみキャッシュを使用）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 最新の取得に成功したらキャッシュも更新
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // オフラインなどで通信失敗した時だけキャッシュから返す
        return caches.match(event.request);
      })
  );
});
