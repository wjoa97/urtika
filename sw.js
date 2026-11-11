/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "manifest.json",
    "revision": "4d63faf465fa87ab3f0fba6f39e5bb67"
  }, {
    "url": "logo.svg",
    "revision": "810fed2612b19bac9846c9c3a2a624aa"
  }, {
    "url": "index.html",
    "revision": "490334bc5c9a53fdd456a4d80f6d328e"
  }, {
    "url": "icon-512.png",
    "revision": "1ebd336b60365959fced8fa38575fec8"
  }, {
    "url": "icon-192.png",
    "revision": "06d827da1daffca0c57e9c3478d87826"
  }, {
    "url": "favicon.png",
    "revision": "f361462028c4acdd74c9f99f545580e0"
  }, {
    "url": "download.html",
    "revision": "80c093ccfb1fe0485b429f48a3f0206e"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/purify.es-BZxk_wWO.js",
    "revision": null
  }, {
    "url": "assets/index.es-SEqxBCm0.js",
    "revision": null
  }, {
    "url": "assets/index-DoXD4CHw.js",
    "revision": null
  }, {
    "url": "assets/index-D9jPH2rC.css",
    "revision": null
  }, {
    "url": "assets/html2canvas-D65zDFPp.js",
    "revision": null
  }, {
    "url": "assets/aistudio/image_d4dc9dfa.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_cf9e1681.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_af9507a7.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_a7715133.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_6ddd957a.png",
    "revision": null
  }, {
    "url": "favicon.png",
    "revision": "f361462028c4acdd74c9f99f545580e0"
  }, {
    "url": "icon-192.png",
    "revision": "06d827da1daffca0c57e9c3478d87826"
  }, {
    "url": "icon-512.png",
    "revision": "1ebd336b60365959fced8fa38575fec8"
  }, {
    "url": "logo.svg",
    "revision": "810fed2612b19bac9846c9c3a2a624aa"
  }, {
    "url": "manifest.webmanifest",
    "revision": "32e59953833192ac2fee4d872d781874"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
