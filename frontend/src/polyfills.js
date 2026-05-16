// src/polyfills.js - COMPLETE FIXED VERSION
if (typeof global === 'undefined') {
  window.global = window;
  self.global = self;
}

if (typeof globalThis === 'undefined') {
  window.globalThis = window;
  self.globalThis = self;
}

if (typeof process === 'undefined') {
  window.process = {
    env: {},
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    browser: true,
    version: '',
    versions: {},
    platform: 'browser',
    cwd: () => '/',
    stdout: { write: () => {} },
    stderr: { write: () => {} },
    stdin: {},
    argv: [],
    execPath: '',
    exit: () => {},
    kill: () => {},
    pid: 1,
    title: 'browser',
    arch: 'browser',
    platform: 'browser',
    memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0 })
  };
}

if (typeof Buffer === 'undefined') {
  const textEncoder = new TextEncoder();
  window.Buffer = {
    from: (data) => {
      if (typeof data === 'string') {
        return textEncoder.encode(data);
      }
      return new Uint8Array(data);
    },
    isBuffer: () => false,
    alloc: (size) => new Uint8Array(size),
    allocUnsafe: (size) => new Uint8Array(size),
    concat: (list) => {
      let length = 0;
      for (const buf of list) length += buf.length;
      const result = new Uint8Array(length);
      let offset = 0;
      for (const buf of list) {
        result.set(buf, offset);
        offset += buf.length;
      }
      return result;
    }
  };
}

if (typeof window.URL === 'undefined') {
  window.URL = window.webkitURL || window.URL;
}

if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  window.CustomEvent = CustomEvent;
  CustomEvent.prototype = window.Event.prototype;
}

if (!navigator.mediaDevices) {
  navigator.mediaDevices = {};
}

if (!navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia = function(constraints) {
    const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

if (!navigator.mediaDevices.enumerateDevices) {
  navigator.mediaDevices.enumerateDevices = function() {
    return Promise.resolve([]);
  };
}

if (!window.RTCPeerConnection) {
  window.RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
}

if (!window.RTCSessionDescription) {
  window.RTCSessionDescription = window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
}

if (!window.RTCIceCandidate) {
  window.RTCIceCandidate = window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
}

console.log('✅ All WebRTC polyfills loaded');

export default null;