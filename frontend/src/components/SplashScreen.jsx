// src/components/SplashScreen.jsx
// A calm, premium splash screen — staged entrance, no visual noise.
import { useEffect, useState, useRef } from "react";
import "../styles/splash.css";

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // Total time on screen — 2.2s feels respectful to the user.
  // (AI-generated splashes usually run 4–6s and feel like a punishment.)
  const HOLD_MS = 2200;
  const EXIT_MS = 700;

  useEffect(() => {
    const start = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - start;
      // Ease-out progress so it feels like it's settling, not loading linearly
      const linear = Math.min(1, elapsed / HOLD_MS);
      const eased = 1 - Math.pow(1 - linear, 3);
      setProgress(Math.round(eased * 100));
      if (linear < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const leaveTimer = setTimeout(() => setIsLeaving(true), HOLD_MS);
    const doneTimer = setTimeout(() => {
      if (finishRef.current) finishRef.current();
    }, HOLD_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      className={`alveoly-splash ${isLeaving ? "is-leaving" : ""}`}
      role="status"
      aria-label="Loading Alveoly"
    >
      {/* Logo */}
      <div
        className={`alveoly-splash__logo-wrap ${
          !isLeaving ? "is-breathing" : ""
        }`}
      >
        {!imgFailed ? (
          <img
            src="/images/alveoly-log.png"
            alt=""
            className="alveoly-splash__logo"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="alveoly-splash__monogram">A</span>
        )}
      </div>

      {/* Wordmark */}
      <h1 className="alveoly-splash__wordmark">Alveoly</h1>

      {/* Progress */}
      <div className="alveoly-splash__progress" aria-hidden="true">
        <div
          className="alveoly-splash__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer */}
      <div className="alveoly-splash__footer">
        © {new Date().getFullYear()} Alveoly
      </div>
    </div>
  );
};

export default SplashScreen;