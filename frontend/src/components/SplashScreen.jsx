// src/components/SplashScreen.jsx - COMPLETE ANIMATED SPLASH SCREEN
import { useEffect, useState } from "react";

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Total splash duration in ms
  const SPLASH_DURATION = 2800;
  // Exit animation duration
  const EXIT_DURATION = 600;

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(
        100,
        (elapsed / SPLASH_DURATION) * 100
      );
      setProgress(calculatedProgress);

      if (calculatedProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 30);

    // Trigger exit animation slightly before end
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, SPLASH_DURATION - 100);

    // Call onFinish after exit animation completes
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, SPLASH_DURATION + EXIT_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-out ${
        isExiting
          ? "opacity-0 scale-110 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #4c1d95 70%, #7c3aed 100%)",
      }}
    >
      {/* ============ ANIMATED BACKGROUND ORBS ============ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="splash-orb splash-orb-1" />
        <div className="splash-orb splash-orb-2" />
        <div className="splash-orb splash-orb-3" />
        <div className="splash-orb splash-orb-4" />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Radial glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[120px] splash-pulse-glow" />
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Logo Container with rings */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 -m-6 rounded-full border-2 border-transparent splash-ring-rotate">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_20px_4px_rgba(167,139,250,0.8)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_15px_3px_rgba(244,114,182,0.8)]" />
          </div>

          {/* Inner rotating ring (opposite direction) */}
          <div className="absolute inset-0 -m-3 rounded-full border border-transparent splash-ring-rotate-reverse">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_3px_rgba(96,165,250,0.8)]" />
          </div>

          {/* Logo */}
          <div className="splash-logo-pop relative">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.7)] flex items-center justify-center p-3">
              <img
                src="/images/alveoly-log.png"
                alt="Alveoly"
                className="w-full h-full object-contain splash-logo-float"
                onError={(e) => {
                  // Fallback if image missing
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name with shimmer effect */}
        <h1 className="splash-text-appear mt-8 text-4xl sm:text-5xl font-bold tracking-wider splash-shimmer-text">
          ALVEOLY
        </h1>

        {/* Tagline */}
        <p className="splash-text-appear-delayed mt-2 text-sm sm:text-base font-medium text-purple-200/80 tracking-[0.3em] uppercase">
          E-Learning Platform
        </p>

        {/* Loading dots */}
        <div className="splash-text-appear-delayed flex items-center gap-1.5 mt-10">
          <span className="splash-dot" />
          <span className="splash-dot" style={{ animationDelay: "0.15s" }} />
          <span className="splash-dot" style={{ animationDelay: "0.3s" }} />
        </div>

        {/* Progress bar */}
        <div className="splash-text-appear-delayed mt-6 w-64 max-w-[80vw]">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 12px rgba(167, 139, 250, 0.8)",
              }}
            />
          </div>
          <p className="text-center text-xs text-white/40 mt-3 font-medium tracking-wider">
            {progress < 30
              ? "Loading assets..."
              : progress < 60
              ? "Preparing experience..."
              : progress < 90
              ? "Almost ready..."
              : "Welcome! 🎓"}
          </p>
        </div>
      </div>

      {/* ============ BOTTOM BRANDING ============ */}
      <div
        className={`absolute bottom-8 left-0 right-0 text-center transition-opacity duration-500 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-xs text-white/30 font-medium tracking-wider">
          © {new Date().getFullYear()} Alveoly. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;