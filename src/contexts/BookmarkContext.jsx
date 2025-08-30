import { createContext, useContext, useState, useEffect } from "react";

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mangaBookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error("Error loading bookmarks:", error);
        setBookmarks([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mangaBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (manga) => {
    setBookmarks((prev) => {

      if (prev.some((bookmark) => bookmark.id === manga.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: manga.id,
          title: manga.title,
          originalTitle: manga.originalTitle,
          coverImage: manga.coverImage,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeBookmark = (mangaId) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== mangaId));
  };

  const isBookmarked = (mangaId) => {
    return bookmarks.some((bookmark) => bookmark.id === mangaId);
  };

  const toggleBookmark = (manga) => {
    if (isBookmarked(manga.id)) {
      removeBookmark(manga.id);
    } else {
      addBookmark(manga);
    }
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  const value = {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    clearAllBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
