import React, { createContext, useContext, useRef } from "react";

const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
  const scrollRef = useRef(null);

  const scrollToTop = (behavior = "auto") => {
    if (scrollRef.current) {
      try {
        const scrollElement = scrollRef.current.getScrollElement();
        if (scrollElement) {
          if (behavior === "auto" || behavior === "instant") {
            // Use direct assignment for instant scroll (better performance)
            scrollElement.scrollTop = 0;
            scrollElement.scrollLeft = 0;
          } else {
            // Use scrollTo with behavior for smooth scroll
            scrollElement.scrollTo({
              top: 0,
              left: 0,
              behavior,
            });
          }
        }
      } catch (error) {
        console.warn("SimpleBar scroll failed, using window scroll:", error);
        if (behavior === "auto" || behavior === "instant") {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior,
          });
        }
      }
    }
  };

  const scrollToElement = (elementId, behavior = "smooth") => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  };

  return (
    <ScrollContext.Provider
      value={{
        scrollRef,
        scrollToTop,
        scrollToElement,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};

export default ScrollContext;
