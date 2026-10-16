const CACHE='nexora-shell-v4';
const CORE=['/','/index.html','/nexora-logo.png','/favicon.png','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET') return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin || url.pathname.startsWith('/api/')) return;
 // Always prefer the network for application code and styles so deployments cannot
 // leave users on an old broken bundle.
 if(/\.(?:js|jsx|css|map)$/.test(url.pathname) || url.pathname.startsWith('/assets/')){
   event.respondWith(fetch(req).catch(()=>caches.match(req)));
   return;
 }
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',copy));return res}).catch(()=>caches.match('/index.html')));
   return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
   return res;
 }).catch(()=>cached)));
});

// Display push alerts even when the NEXORA page is closed.
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data ? event.data.text() : '' }; }
  const title = String(payload.title || 'NEXORA update').slice(0, 120);
  const options = {
    body: String(payload.body || 'You have a new NEXORA update.').slice(0, 300),
    icon: payload.icon || '/nexora-logo.png',
    badge: payload.badge || '/favicon.png',
    tag: payload.tag || 'nexora-update',
    renotify: false,
    data: { url: payload.url || '/' },
    timestamp: Number(payload.timestamp || Date.now())
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const rawUrl = event.notification?.data?.url || '/';
  let target = '/';
  try { const parsed = new URL(rawUrl, self.location.origin); if (parsed.origin === self.location.origin) target = parsed.href; } catch {}
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async windows => {
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin) {
        if ('navigate' in client) await client.navigate(target).catch(() => {});
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
