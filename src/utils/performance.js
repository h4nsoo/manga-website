/**
 * Performance optimizations for scroll handling and smooth animations
 */

// Enhanced debounce function with immediate execution option
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Enhanced throttle function with leading and trailing options
export const throttle = (func, limit, options = {}) => {
  let inThrottle;
  let lastFunc;
  let lastRan;
  const { leading = true, trailing = true } = options;

  return function (...args) {
    const context = this;

    if (!inThrottle) {
      if (leading) {
        func.apply(context, args);
      }
      inThrottle = true;
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      if (trailing) {
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }

    setTimeout(() => {
      inThrottle = false;
    }, limit);
  };
};

// RequestAnimationFrame wrapper for smooth animations
export const rafSchedule = (fn) => {
  let rafId = null;

  return (...args) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
};

// Easing functions for smooth animations
export const easing = {
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  linear: (t) => t,
};

// Smooth scroll function with easing
export const smoothScrollTo = (
  targetY,
  duration = 800,
  easingFunc = easing.easeOutCubic
) => {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  const animateScroll = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunc(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

// Optimized scroll handler with options
export const createOptimizedScrollHandler = (callback, options = {}) => {
  const { throttleMs = 16, useRAF = true, passive = true } = options;

  let ticking = false;
  let lastScrollY = window.pageYOffset;

  const handleScroll = useRAF
    ? rafSchedule(() => {
        const currentScrollY = window.pageYOffset;
        if (currentScrollY !== lastScrollY) {
          callback(currentScrollY, lastScrollY);
          lastScrollY = currentScrollY;
        }
        ticking = false;
      })
    : throttle(() => {
        const currentScrollY = window.pageYOffset;
        if (currentScrollY !== lastScrollY) {
          callback(currentScrollY, lastScrollY);
          lastScrollY = currentScrollY;
        }
      }, throttleMs);

  const onScroll = () => {
    if (!ticking && useRAF) {
      ticking = true;
      handleScroll();
    } else if (!useRAF) {
      handleScroll();
    }
  };

  return {
    addEventListener: () => {
      window.addEventListener("scroll", onScroll, { passive });
    },
    removeEventListener: () => {
      window.removeEventListener("scroll", onScroll);
    },
  };
};

// React hook for smooth scrolling
export const useSmoothScroll = () => {
  const scrollToTop = (duration = 800, easingFunc = easing.easeOutCubic) => {
    smoothScrollTo(0, duration, easingFunc);
  };

  const scrollToElement = (
    elementId,
    offset = 0,
    duration = 800,
    easingFunc = easing.easeOutCubic
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      const targetY = element.offsetTop - offset;
      smoothScrollTo(targetY, duration, easingFunc);
    }
  };

  return {
    scrollToTop,
    scrollToElement,
    smoothScrollTo,
  };
};
