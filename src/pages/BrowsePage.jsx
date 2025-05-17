import { useState, useEffect } from "react";
import MangaGrid from "../components/MangaGrid";
import SearchBox from "../components/SearchBox";
import Loader from "../components/Loader";
import "../styles/BrowsePage.css";

function BrowsePage() {
  const [manga, setManga] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  useEffect(() => {
    fetchRandomManga();
  }, []);

  const getCoverImageUrl = (mangaId, fileName) => {
    if (!fileName) return "https://via.placeholder.com/150?text=No+Cover";
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };

  async function fetchRandomManga() {
    setLoading(true);
    setError(null);
    setManga([]);

    try {
      const response = await fetch(
        `${BASE_URL}/manga?limit=20&contentRating[]=safe&includes[]=cover_art`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch manga: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const formattedData = data.data.map((manga) => {
          const coverRelationship = manga.relationships.find(
            (rel) => rel.type === "cover_art"
          );

          let coverFileName = null;
          if (coverRelationship && coverRelationship.attributes) {
            coverFileName = coverRelationship.attributes.fileName;
          }

          return {
            id: manga.id,
            title:
              manga.attributes.title.en ||
              manga.attributes.title.ja ||
              Object.values(manga.attributes.title)[0],
            coverImage: getCoverImageUrl(manga.id, coverFileName),
            description:
              manga.attributes.description?.en || "No description available",
          };
        });

        setManga(formattedData);
      } else {
        // No manga found in API response
        setError("No manga available at this time. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching manga:", err);
      setError("Failed to load manga. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const displayedManga = searchResults || manga;

  return (
    <div className="browse-page">
      <h1>Browse Manga</h1>

      <div className="browse-controls">
        <SearchBox
          onSearch={handleSearch}
          getCoverImageUrl={getCoverImageUrl}
        />

        {searchResults && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchResults(null)}
          >
            Clear Search Results
          </button>
        )}
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchRandomManga}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader message="Loading manga..." />
      ) : (
        <>
          {!error && (
            <>
              {searchResults && (
                <p className="search-results-count">
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
              )}

              {displayedManga.length > 0 ? (
                <MangaGrid manga={displayedManga} />
              ) : (
                <div className="no-results">
                  <p>No manga found matching your search.</p>
                  <button className="browse-btn" onClick={fetchRandomManga}>
                    Browse Popular Manga
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default BrowsePage;
