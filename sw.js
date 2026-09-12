/* AFN Sample Draw — offline service worker.
   Bump VERSION on every release; that is what pushes an update to phones
   already carrying the app. Nothing else needs to change. */
"use strict";

var VERSION = "2026-09-12.1";
var CACHE = "afn-draw-" + VERSION;

var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // reload: bypass the HTTP cache so a release never precaches stale bytes
      return Promise.all(SHELL.map(function(url){
        return c.add(new Request(url, { cache: "reload" }))["catch"](function(){});
      }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k !== CACHE && k.indexOf("afn-draw-") === 0 ? caches["delete"](k) : null;
      }));
    }).then(function(){
      return self.registration.navigationPreload
        ? self.registration.navigationPreload.disable()
        : null;
    }).then(function(){ return self.clients.claim(); })
  );
});

// The page asks for this when the user taps "Update now".
self.addEventListener("message", function(e){
  if (e.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: serve the app shell from cache, fall back to the network.
  // Keeps the app opening instantly and working with no signal at all.
  if (req.mode === "navigate"){
    e.respondWith(
      caches.match("./index.html", { ignoreSearch: true }).then(function(hit){
        return hit || fetch(req);
      })["catch"](function(){ return fetch(req); })
    );
    return;
  }

  // Everything else: cache first, then network, and keep what the network gives.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && res.ok && res.type === "basic"){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
