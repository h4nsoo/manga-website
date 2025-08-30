import { useBookmarks } from "../contexts/BookmarkContext";
import MangaGrid from "../components/MangaGrid";
import "../styles/BookmarksPage.css";

const BookmarksPage = () => {
  const { bookmarks, clearAllBookmarks } = useBookmarks();

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <h1>My Bookmarks</h1>
        <p className="subtitle">
          Your personal manga collection ({bookmarks.length} series)
        </p>
        {bookmarks.length > 0 && (
          <div className="bookmarks-header-actions">
            <button className="clear-all-btn" onClick={clearAllBookmarks}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-bookmarks">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
          </svg>
          <h2>No Bookmarks Yet</h2>
          <p>Start bookmarking your favorite manga series!</p>
        </div>
      ) : (
        <MangaGrid
          manga={bookmarks}
          emptyMessage="No bookmarked manga found."
          fromPage="/bookmarks"
        />
      )}
    </div>
  );
};

export default BookmarksPage;
