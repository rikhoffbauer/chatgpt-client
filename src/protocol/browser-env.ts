import { randomUUID, webcrypto } from 'node:crypto'
import type { UnknownRecord } from '../types.js'

const CHROME_VERSION = '140.0.0.0'
const CHROME_MAJOR = CHROME_VERSION.split('.')[0] ?? '140'
export const USER_AGENT = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`

const noop = (): undefined => undefined

function element(extra: UnknownRecord = {}): UnknownRecord {
  return {
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
  }
}

export interface BrowserEnvironmentOptions {
  href?: string
}

export function createWindow(options: BrowserEnvironmentOptions = {}): UnknownRecord {
  const href = options.href ?? 'https://chatgpt.com/'
  const url = new URL(href)
  const timeOrigin = Date.now() - Math.floor(performance.now())
  const scripts = [
    { src: 'https://chatgpt.com/assets/root-index.js', type: 'module', async: false, defer: false },
    { src: 'https://cdn.oaistatic.com/assets/c/1a2b3c4d/_next.js', type: 'text/javascript', async: true, defer: false },
  ]
  const documentElement = element({ getAttribute: (name: unknown) => name === 'data-build' ? 'prod-1a2b3c4d' : null, lang: 'en-US' })
  const document: UnknownRecord = {
    documentElement,
    head: element(),
    body: element({ clientWidth: 1512, clientHeight: 856 }),
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
    createElement: (tag: unknown) => element({ tagName: String(tag).toUpperCase(), getContext: () => null }),
    createTextNode: () => element(),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: (tag: unknown) => String(tag).toLowerCase() === 'script' ? scripts : [],
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    evaluate: undefined,
  }

  const navigator: UnknownRecord = {
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
  Object.setPrototypeOf(navigator, { constructor: function Navigator() {}, toString: () => '[object Navigator]' })

  const storage = (): UnknownRecord => {
    const values = new Map<string, string>()
    return {
      getItem: (key: unknown) => values.get(String(key)) ?? null,
      setItem: (key: unknown, value: unknown) => values.set(String(key), String(value)),
      removeItem: (key: unknown) => values.delete(String(key)),
      clear: () => values.clear(),
      key: (index: unknown) => [...values.keys()][Number(index)] ?? null,
      get length() { return values.size },
    }
  }

  const perf: UnknownRecord = {
    now: () => performance.now(),
    timeOrigin,
    memory: { jsHeapSizeLimit: 4_294_705_152, totalJSHeapSize: 48_000_000, usedJSHeapSize: 32_000_000 },
    getEntriesByType: (type: unknown) => type === 'navigation'
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

  const win: UnknownRecord = {
    document,
    navigator,
    screen: {
      width: 1512,
      height: 982,
      availWidth: 1512,
      availHeight: 944,
      availLeft: 0,
      availTop: 38,
      colorDepth: 30,
      pixelDepth: 30,
      orientation: { angle: 0, type: 'landscape-primary' },
    },
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
    atob: (value: unknown) => Buffer.from(String(value), 'base64').toString('binary'),
    btoa: (value: unknown) => Buffer.from(String(value), 'binary').toString('base64'),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    queueMicrotask,
    requestAnimationFrame: (callback: (timestamp: number) => void) => setTimeout(() => callback(performance.now()), 16),
    cancelAnimationFrame: clearTimeout,
    requestIdleCallback: (callback: (deadline: { didTimeout: boolean; timeRemaining(): number }) => void) => setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1),
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    matchMedia: (query: unknown) => ({ matches: /prefers-color-scheme:\s*dark/.test(String(query)), media: String(query), addListener: noop, addEventListener: noop }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    crypto: {
      randomUUID,
      getRandomValues: (array: Uint8Array) => webcrypto.getRandomValues(array),
      subtle: webcrypto.subtle,
    },
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
  document.defaultView = win
  return win
}
