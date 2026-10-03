// src/utils/socialAuth.js
// Platform detection and native Google Sign-In bridge for Capacitor.
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

const GOOGLE_WEB_CLIENT_ID =
  "373555023169-746elkknmtjl7e0ijghdloibn68kcji7.apps.googleusercontent.com";

/**
 * Returns true when running inside the native Android/iOS app.
 * Returns false on the website.
 */
export const isNativePlatform = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Initialize the native Google Sign-In plugin.
 * Safe to call on the web (it just no-ops).
 * Call once at app startup.
 */
export const initNativeGoogleAuth = async () => {
  if (!isNativePlatform()) return;
  try {
    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
      },
    });
    console.log("✅ Native Google Sign-In initialized");
  } catch (err) {
    console.error("❌ Native Google Sign-In init failed:", err);
  }
};

/**
 * Trigger the native Google sign-in dialog on Android.
 * Resolves to the ID token string.
 */
export const getNativeGoogleIdToken = async () => {
  if (!isNativePlatform()) {
    throw new Error("Not running on a native platform");
  }

  const result = await SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["email", "profile"],
    },
  });

  // Handle multiple possible return shapes across plugin versions
  const idToken =
    result?.result?.idToken ||
    result?.result?.authentication?.idToken ||
    result?.idToken;

  if (!idToken) {
    console.error("Native Google login returned:", result);
    throw new Error("Native Google sign-in did not return an ID token");
  }
  return idToken;
};