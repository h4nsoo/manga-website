import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to scroll to top when route changes
 * @param {React.RefObject} scrollRef - Reference to the scrollable element (SimpleBar)
 */
export const useScrollToTop = (scrollRef) => {
  const location = useLocation();
  const prevLocationRef = useRef();

  useEffect(() => {
    // Only scroll to top if the location actually changed
    if (prevLocationRef.current !== location.pathname) {
      prevLocationRef.current = location.pathname;

      // Immediate scroll to top for better performance
      const scrollToTop = () => {
        if (scrollRef.current) {
          try {
            // For SimpleBar, use direct scrollTop assignment for instant scroll
            const scrollElement = scrollRef.current.getScrollElement();
            if (scrollElement) {
              scrollElement.scrollTop = 0;
              scrollElement.scrollLeft = 0;
            }
          } catch (error) {
            // Fallback to window scroll if SimpleBar method fails
            console.warn(
              "SimpleBar scroll failed, using window scroll:",
              error
            );
            window.scrollTo(0, 0);
          }
        } else {
          // Fallback to window scroll if ref is not available
          window.scrollTo(0, 0);
        }
      };

      // Execute immediately, no timeout needed for instant scroll
      scrollToTop();
    }
  }, [location.pathname, scrollRef]);
};

export default useScrollToTop;
