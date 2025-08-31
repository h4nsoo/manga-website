import { useBookmarks } from "../contexts/BookmarkContext";
import "../styles/BookmarkButton.css";
import bookmarkicon from "../assets/bookmark-white.png";

const BookmarkButton = ({ manga, className = "" }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(manga.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(manga);
  };

  return (
    <button
      className={`bookmark-btn ${bookmarked ? "bookmarked" : ""} ${className}`}
      onClick={handleClick}
      title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      <img
        src={bookmarkicon}
        alt="bookmark"
        className={`bookmark-icon ${bookmarked ? "bookmarked" : ""}`}
        width="20"
        height="20"
      />
    </button>
  );
};

export default BookmarkButton;
