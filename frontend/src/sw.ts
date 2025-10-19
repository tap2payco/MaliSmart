/// <reference lib="webworker" />
// Basic service worker with runtime caching and background sync

declare const self: ServiceWorkerGlobalScope;

const APP_CACHE = 'phs-app-shell-v1';
const RUNTIME_CACHE = 'phs-runtime-v1';
const QUEUE_STORE = 'phs-offline-queue';

const APP_SHELL = [
	'/',
	'/index.html',
	'/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => ![APP_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k))),
		).then(() => self.clients.claim()),
	);
});

function isApiGet(request: Request): boolean {
	return request.method === 'GET' && new URL(request.url).pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (isApiGet(request)) {
		// Network-first for API GET with fallback to cache
		event.respondWith(
			fetch(request)
				.then((resp) => {
					const respClone = resp.clone();
					caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, respClone));
					return resp;
				})
				.catch(() => caches.match(request) as Promise<Response>),
		);
		return;
	}

	if (request.method === 'GET') {
		// Stale-while-revalidate for static assets
		event.respondWith(
			caches.match(request).then((cached) => {
				const fetchPromise = fetch(request)
					.then((resp) => {
						const respClone = resp.clone();
						caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, respClone));
						return resp;
					})
					.catch(() => cached as Response);
				return cached || fetchPromise;
			}),
		);
		return;
	}

	// For non-GET when offline, queue for background sync
	if (!navigator.onLine && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
		event.respondWith(queueRequest(request));
	}
});

async function queueRequest(request: Request): Promise<Response> {
	const db = await openQueueDb();
	const tx = db.transaction(QUEUE_STORE, 'readwrite');
	const store = tx.objectStore(QUEUE_STORE);
	const body = await request.clone().text();
	await store.add({ url: request.url, method: request.method, headers: [...request.headers], body, ts: Date.now() });
	await tx.done;
	await self.registration.sync.register('sync-queue');
	return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { 'Content-Type': 'application/json' } });
}

self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-queue') {
		event.waitUntil(flushQueue());
	}
});

async function flushQueue(): Promise<void> {
	const db = await openQueueDb();
	const tx = db.transaction(QUEUE_STORE, 'readwrite');
	const store = tx.objectStore(QUEUE_STORE);
	const all = await store.getAll();
	for (const item of all) {
		try {
			await fetch(item.url, { method: item.method, headers: item.headers, body: item.body });
			await store.delete(item.id);
		} catch (_) {
			// leave in queue
		}
	}
	await tx.done;
}

// Minimal IndexedDB helper using idb-keyval-like pattern
function openQueueDb(): Promise<any> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open('phs-idb', 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(QUEUE_STORE)) {
				const os = db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
				os.createIndex('ts', 'ts');
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}


