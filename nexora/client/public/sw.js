const CACHE_NAME = "nexora-shell-v10";
const CACHE_PREFIX = "nexora-shell-";
const CORE_ASSETS = ["/", "/index.html", "/nexora-logo.png", "/favicon.png", "/manifest.webmanifest"];
const ASSET_PATTERN = /\.(?:js|mjs|css|woff2?|png|jpe?g|webp|gif|svg|ico|json|webmanifest)$/i;

async function fetchAndCache(cache, url, required = false) {
  try {
    const response = await fetch(url, { cache: "reload" });
    if (!response || !response.ok) throw new Error("Asset request failed: " + url);
    await cache.put(url, response.clone());
    return true;
  } catch (error) {
    if (required) throw error;
    return false;
  }
}

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch("/index.html", { cache: "reload" });
    if (!response.ok) throw new Error("NEXORA shell could not be downloaded");
    const html = await response.clone().text();

    const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
      .map(match => match[1])
      .filter(value => ASSET_PATTERN.test(new URL(value, self.location.origin).pathname));

    const urls = [...new Set([...CORE_ASSETS, ...references])]
      .map(value => new URL(value, self.location.origin))
      .filter(url => url.origin === self.location.origin && url.pathname !== "/" && url.pathname !== "/index.html");

    // JS/CSS bundles are essential: do not activate a new worker unless the
    // complete new app shell is available for offline use.
    await Promise.all(urls.map(url => {
      const required = /\.(?:js|mjs|css)$/i.test(url.pathname);
      return fetchAndCache(cache, url.href, required);
    }));

    // Publish the HTML only after its referenced JS/CSS bundles are cached.
    await cache.put("/index.html", response.clone());
    await cache.put("/", response.clone());
  } catch (error) {
    await caches.delete(CACHE_NAME);
    throw error;
  }
}

self.addEventListener("install", event => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never cache API, payment, account, or third-party requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        return (await caches.match("/index.html")) ||
          (await caches.match("/")) ||
          new Response(
            '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07090d"><title>NEXORA Offline</title><body style="margin:0;background:#07090d;color:#edf4ff;font:16px system-ui,sans-serif;display:grid;min-height:100vh;place-items:center"><main style="max-width:420px;padding:28px;text-align:center"><h1>NEXORA</h1><h2>You’re offline</h2><p>Open NEXORA while connected once to make it available offline. Previously cached pages may still be available.</p><button onclick="location.reload()" style="padding:12px 18px;border:0;border-radius:10px">Try again</button></main></body></html>',
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
      }
    })());
    return;
  }

  if (ASSET_PATTERN.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone()).catch(() => {});
          return response;
        }
        throw new Error("Asset request failed");
      } catch {
        return (await caches.match(request)) ||
          (await caches.match(url.href)) ||
          (await caches.match(url.pathname)) ||
          Response.error();
      }
    })());
    return;
  }

  // Cache same-origin non-API GET resources opportunistically for repeat/offline viewing.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone()).catch(() => {});
        return response;
      }
      throw new Error("Resource request failed");
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }
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
  try {
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin === self.location.origin) target = parsed.href;
  } catch {}
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