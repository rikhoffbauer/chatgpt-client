// @ts-nocheck
// A minimal browser-ish global object for the Turnstile VM to walk.
//
// The dx program pokes at DOM/BOM surfaces through opcode 6 (property get) and
// opcode 7 (call). Anything it touches that we do not model comes back
// `undefined`, which the VM handles (opcode 23 explicitly branches on it), so
// this only has to be plausible, not complete.

import { randomUUID, webcrypto } from 'node:crypto'

const CHROME_VERSION = '140.0.0.0'
const CHROME_MAJOR = CHROME_VERSION.split('.')[0]
export const USER_AGENT = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`

const noop = () => undefined
const el = (extra = {}) => ({
  getAttribute: () => null,
  setAttribute: noop,
  appendChild: noop,
  removeChild: noop,
  addEventListener: noop,
  removeEventListener: noop,
  getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }),
  style: {},
  children: [],
  childNodes: [],
  ...extra,
})

export function createWindow({ href = 'https://chatgpt.com/' } = {}) {
  const url = new URL(href)
  const timeOrigin = Date.now() - Math.floor(performance.now())

  const scripts = [
    { src: 'https://chatgpt.com/assets/root-index.js', type: 'module', async: false, defer: false },
    { src: 'https://cdn.oaistatic.com/assets/c/1a2b3c4d/_next.js', type: 'text/javascript', async: true, defer: false },
  ]

  const documentElement = el({ getAttribute: (name) => (name === 'data-build' ? 'prod-1a2b3c4d' : null), lang: 'en-US' })

  const document = {
    documentElement,
    head: el(),
    body: el({ clientWidth: 1512, clientHeight: 856 }),
    scripts,
    cookie: '',
    referrer: '',
    title: 'ChatGPT',
    URL: href,
    domain: url.hostname,
    readyState: 'complete',
    visibilityState: 'visible',
    hidden: false,
    characterSet: 'UTF-8',
    contentType: 'text/html',
    hasFocus: () => true,
    createElement: (tag) =>
      el({
        tagName: String(tag).toUpperCase(),
        // canvas fingerprinting attempts land here
        getContext: () => null,
      }),
    createTextNode: () => el(),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: (tag) => (String(tag).toLowerCase() === 'script' ? scripts : []),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    evaluate: undefined,
  }

  const navigator = {
    userAgent: USER_AGENT,
    appVersion: USER_AGENT.replace('Mozilla/', ''),
    appName: 'Netscape',
    appCodeName: 'Mozilla',
    product: 'Gecko',
    productSub: '20030107',
    vendor: 'Google Inc.',
    vendorSub: '',
    platform: 'MacIntel',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    maxTouchPoints: 0,
    onLine: true,
    cookieEnabled: true,
    doNotTrack: null,
    webdriver: false,
    pdfViewerEnabled: true,
    plugins: { length: 5 },
    mimeTypes: { length: 2 },
    userAgentData: {
      brands: [
        { brand: 'Chromium', version: CHROME_MAJOR },
        { brand: 'Google Chrome', version: CHROME_MAJOR },
        { brand: 'Not=A?Brand', version: '24' },
      ],
      mobile: false,
      platform: 'macOS',
      getHighEntropyValues: async () => ({ architecture: 'arm', bitness: '64', model: '', platformVersion: '15.0.0' }),
    },
    permissions: { query: async () => ({ state: 'prompt' }) },
    connection: { downlink: 10, effectiveType: '4g', rtt: 50, saveData: false },
    storage: { estimate: async () => ({ quota: 299_977_904_128, usage: 51_349 }) },
    sendBeacon: () => true,
    getBattery: undefined,
    clipboard: {},
    mediaDevices: {},
    serviceWorker: {},
  }
  // dya() picks a random key off Object.getPrototypeOf(navigator) — give it one
  Object.setPrototypeOf(navigator, { constructor: function Navigator() {}, toString: () => '[object Navigator]' })

  const screen = {
    width: 1512,
    height: 982,
    availWidth: 1512,
    availHeight: 944,
    availLeft: 0,
    availTop: 38,
    colorDepth: 30,
    pixelDepth: 30,
    orientation: { angle: 0, type: 'landscape-primary' },
  }

  const storage = () => {
    const map = new Map()
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      clear: () => map.clear(),
      key: (i) => [...map.keys()][i] ?? null,
      get length() {
        return map.size
      },
    }
  }

  const perf = {
    now: () => performance.now(),
    timeOrigin,
    memory: { jsHeapSizeLimit: 4_294_705_152, totalJSHeapSize: 48_000_000, usedJSHeapSize: 32_000_000 },
    getEntriesByType: (type) =>
      type === 'navigation'
        ? [{ type: 'navigate', duration: 812.4, domComplete: 780.1, loadEventEnd: 812.4, transferSize: 41_233 }]
        : [],
    getEntries: () => [],
    mark: noop,
    measure: noop,
    timing: { navigationStart: timeOrigin, loadEventEnd: timeOrigin + 812 },
  }

  const location = {
    href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    ancestorOrigins: { length: 0 },
    toString: () => href,
  }

  const win = {
    document,
    navigator,
    screen,
    location,
    performance: perf,
    history: { length: 2, scrollRestoration: 'auto', state: null },
    localStorage: storage(),
    sessionStorage: storage(),
    innerWidth: 1512,
    innerHeight: 856,
    outerWidth: 1512,
    outerHeight: 944,
    devicePixelRatio: 2,
    screenX: 0,
    screenY: 38,
    scrollX: 0,
    scrollY: 0,
    origin: url.origin,
    isSecureContext: true,
    crossOriginIsolated: false,
    closed: false,
    name: '',
    // JS built-ins the program may reach for through the global
    Object,
    Array,
    String,
    Number,
    Boolean,
    Math,
    JSON,
    Date,
    RegExp,
    Error,
    Promise,
    Map,
    Set,
    WeakMap,
    Symbol,
    Proxy,
    Reflect,
    Intl,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    setTimeout: (...a) => setTimeout(...a),
    clearTimeout: (...a) => clearTimeout(...a),
    setInterval: (...a) => setInterval(...a),
    clearInterval: (...a) => clearInterval(...a),
    queueMicrotask: (...a) => queueMicrotask(...a),
    requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now()), 16),
    cancelAnimationFrame: clearTimeout,
    requestIdleCallback: (cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    matchMedia: (query) => ({ matches: /prefers-color-scheme:\s*dark/.test(query), media: query, addListener: noop, addEventListener: noop }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    crypto: { randomUUID, getRandomValues: (arr) => webcrypto.getRandomValues(arr), subtle: webcrypto.subtle },
    chrome: { runtime: {}, loadTimes: () => ({}), csi: () => ({}), app: { isInstalled: false } },
    indexedDB: {},
    caches: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    WebSocket: undefined,
    RTCPeerConnection: undefined,
    Notification: { permission: 'default' },
    speechSynthesis: { getVoices: () => [] },
    webkitAudioContext: undefined,
    AudioContext: undefined,
    OffscreenCanvas: undefined,
    WebGLRenderingContext: undefined,
    Worker: undefined,
    onerror: null,
    onload: null,
  }

  win.window = win
  win.self = win
  win.top = win
  win.parent = win
  win.frames = win
  win.globalThis = win
  win.document.defaultView = win

  return win
}
