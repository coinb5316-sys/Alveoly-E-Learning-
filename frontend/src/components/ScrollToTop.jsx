// src/components/ScrollToTop.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top on every route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // use "instant" to avoid smooth-scroll jump from previous page
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;