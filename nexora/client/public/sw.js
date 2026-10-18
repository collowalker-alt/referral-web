const CACHE_NAME = "nexora-shell-v5";
const CACHE_PREFIX = "nexora-shell-";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/nexora-logo.png",
  "/favicon.png",
  "/manifest.webmanifest"
];

async function cacheResponse(cache, url, requestOptions = {}) {
  try {
    const response = await fetch(url, requestOptions);
    if (response && response.ok) await cache.put(url, response.clone());
  } catch {}
}

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch("/index.html", { cache: "no-store" });
    if (!response.ok) return;
    const html = await response.clone().text();
    await cache.put("/index.html", response.clone());
    await cache.put("/", response.clone());

    // Vite emits hashed JS/CSS files. Cache the files referenced by the HTML
    // during install, so the first successful visit can also become offline-ready.
    const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
      .map(match => match[1])
      .filter(value => /\.(?:js|css|woff2?|png|webp|svg)(?:[?#].*)?$/i.test(value));

    const urls = [...new Set([...CORE_ASSETS, ...references])];
    await Promise.allSettled(urls.map(async value => {
      const url = new URL(value, self.location.origin);
      if (url.origin !== self.location.origin) return;
      if (url.pathname === "/" || url.pathname === "/index.html") return;
      await cacheResponse(cache, url.href, { cache: "no-store" });
    }));
  } catch {
    // Keep the worker installable if the server briefly drops during deployment.
  }
}

self.addEventListener("install", event => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // API responses, payment requests, and third-party hosts must never be cached.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await Promise.allSettled([
            cache.put("/index.html", response.clone()),
            cache.put("/", response.clone())
          ]);
          return response;
        }
        throw new Error("Navigation request failed");
      } catch {
        const cached = await caches.match("/index.html") || await caches.match("/");
        if (cached) return cached;
        return new Response(
          '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07090d"><title>NEXORA Offline</title><body style="margin:0;background:#07090d;color:#edf4ff;font:16px system-ui,sans-serif;display:grid;min-height:100vh;place-items:center"><main style="max-width:420px;padding:28px;text-align:center"><h1>NEXORA</h1><h2>You’re offline</h2><p>Connect to the internet once to load NEXORA, then try again.</p><button onclick="location.reload()" style="padding:12px 18px;border:0;border-radius:10px">Try again</button></main></body></html>',
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    })());
    return;
  }

  const isStaticAsset = /\.(?:js|mjs|css|map|woff2?|png|jpe?g|webp|gif|svg|ico|json|webmanifest)$/i.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response.clone()).catch(() => {});
          return response;
        }
        throw new Error("Static asset request failed");
      } catch {
        return await cache.match(request) || await cache.match(url.pathname) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone()).catch(() => {});
        return response;
      }
      throw new Error("Resource request failed");
    } catch {
      return await cache.match(request) || Response.error();
    }
  })());
});

// Display push alerts even when the NEXORA page is closed.
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data ? event.data.text() : "" }; }
  const title = String(payload.title || "NEXORA update").slice(0, 120);
  const options = {
    body: String(payload.body || "You have a new NEXORA update.").slice(0, 300),
    icon: payload.icon || "/nexora-logo.png",
    badge: payload.badge || "/favicon.png",
    tag: payload.tag || "nexora-update",
    renotify: false,
    data: { url: payload.url || "/" },
    timestamp: Number(payload.timestamp || Date.now())
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const rawUrl = event.notification?.data?.url || "/";
  let target = "/";
  try { const parsed = new URL(rawUrl, self.location.origin); if (parsed.origin === self.location.origin) target = parsed.href; } catch {}
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async windows => {
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        if ("navigate" in client) await client.navigate(target).catch(() => {});
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
