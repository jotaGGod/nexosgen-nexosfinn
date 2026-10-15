/* Nunca guarda HTML autenticado, respostas de API ou cookies em cache. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(fetch(request).catch(() => new Response(
    '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="apple-mobile-web-app-capable" content="yes"><title>NexosFinn — Sem conexão</title><body style="margin:0;min-height:100dvh;display:grid;place-content:center;background:#050505;color:#fafafa;font:16px system-ui;padding:24px;box-sizing:border-box"><main><h1>Sem conexão</h1><p>Conecte-se à internet para consultar suas finanças.</p><button onclick="location.reload()" style="padding:14px 22px;border:0;border-radius:24px;background:#c6ff3d;color:#050505;font:inherit">Tentar novamente</button></main></body></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  )));
});
