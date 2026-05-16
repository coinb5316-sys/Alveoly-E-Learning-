// frontend/src/main.jsx - PRODUCTION READY
import './polyfills';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ==================== POLYFILLS FOR WEBRTC & SIMPLE-PEER ====================

// Fix for simple-peer "global is not defined" error
if (typeof global === 'undefined') {
  window.global = window;
  global = window;
}

if (typeof globalThis === 'undefined') {
  window.globalThis = window;
  globalThis = window;
}

// Process polyfill for WebRTC libraries
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
  };
  process = window.process;
}

// Buffer polyfill - FIXED: No top-level await
if (typeof Buffer === 'undefined') {
  // Synchronous fallback first
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
  
  // Try to load the real buffer asynchronously
  import('buffer').then(module => {
    window.Buffer = module.Buffer;
    console.log('✅ Buffer polyfill upgraded');
  }).catch(() => {});
}

// URL polyfill for WebRTC
if (typeof window.URL === 'undefined') {
  window.URL = window.webkitURL || window.URL;
}

// CustomEvent polyfill for older browsers
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

// MediaDevices polyfill
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

// RTCPeerConnection polyfill
if (!window.RTCPeerConnection) {
  window.RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
}

console.log('✅ Polyfills loaded for WebRTC and simple-peer');

// ==================== APP RENDER ====================

const root = document.getElementById("root");

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID is not set. Google Login will not work.');
}

createRoot(root).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'dummy'}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);