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
    // Always scroll to top when location changes, including initial load
    const currentPath = location.pathname + location.search + location.hash;

    if (prevLocationRef.current !== currentPath) {
      prevLocationRef.current = currentPath;

      // Use requestAnimationFrame to ensure DOM is ready
      const scrollToTop = () => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            try {
              // For SimpleBar, use direct scrollTop assignment for instant scroll
              const scrollElement = scrollRef.current.getScrollElement();
              if (scrollElement) {
                // Temporarily disable smooth scroll behavior
                const originalBehavior = scrollElement.style.scrollBehavior;
                scrollElement.style.scrollBehavior = "auto";

                scrollElement.scrollTop = 0;
                scrollElement.scrollLeft = 0;

                // Restore original scroll behavior
                setTimeout(() => {
                  scrollElement.style.scrollBehavior = originalBehavior;
                }, 0);
              }
            } catch (error) {
              // Fallback to window scroll if SimpleBar method fails
              console.warn(
                "SimpleBar scroll failed, using window scroll:",
                error
              );
              // Temporarily disable smooth scroll for window
              const originalBehavior =
                document.documentElement.style.scrollBehavior;
              document.documentElement.style.scrollBehavior = "auto";
              window.scrollTo(0, 0);
              setTimeout(() => {
                document.documentElement.style.scrollBehavior =
                  originalBehavior;
              }, 0);
            }
          } else {
            // Fallback to window scroll if ref is not available
            const originalBehavior =
              document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            setTimeout(() => {
              document.documentElement.style.scrollBehavior = originalBehavior;
            }, 0);
          }
        });
      };

      // Execute immediately
      scrollToTop();
    }
  }, [location.pathname, location.search, location.hash, scrollRef]);

  // Additional effect to handle initial page load
  useEffect(() => {
    // Scroll to top on initial mount
    const handleInitialScroll = () => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          try {
            const scrollElement = scrollRef.current.getScrollElement();
            if (scrollElement) {
              // Temporarily disable smooth scroll behavior
              const originalBehavior = scrollElement.style.scrollBehavior;
              scrollElement.style.scrollBehavior = "auto";

              scrollElement.scrollTop = 0;
              scrollElement.scrollLeft = 0;

              // Restore original scroll behavior
              setTimeout(() => {
                scrollElement.style.scrollBehavior = originalBehavior;
              }, 0);
            }
          } catch (error) {
            const originalBehavior =
              document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            setTimeout(() => {
              document.documentElement.style.scrollBehavior = originalBehavior;
            }, 0);
          }
        } else {
          const originalBehavior =
            document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, 0);
          setTimeout(() => {
            document.documentElement.style.scrollBehavior = originalBehavior;
          }, 0);
        }
      });
    };

    handleInitialScroll();
  }, []); // Empty dependency array for initial mount only
};

export default useScrollToTop;
