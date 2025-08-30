import {
  useSmoothScroll,
  createOptimizedScrollHandler,
} from "../utils/performance";
import { useState, useEffect } from "react";
import "../styles/SmoothScroll.css";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop } = useSmoothScroll();

  useEffect(() => {
    const scrollHandler = createOptimizedScrollHandler(
      () => {
        setIsVisible(window.pageYOffset > 300);
      },
      { throttleMs: 100 }
    );

    scrollHandler.addEventListener();

    return () => scrollHandler.removeEventListener();
  }, []);

  if (!isVisible) return null;

  return (
    <button
      className="back-to-top-btn"
      onClick={() => scrollToTop(800)}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};

export default BackToTopButton;
