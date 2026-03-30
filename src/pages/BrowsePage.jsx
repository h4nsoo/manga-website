import { useState, useEffect } from "react";
import MangaGrid from "../components/MangaGrid";
import SearchBox from "../components/SearchBox";
import Loader from "../components/Loader";
import "../styles/BrowsePage.css";

function BrowsePage() {
  const [manga, setManga] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const LIMIT = 20;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getCoverImageUrl = (mangaId, fileName) => {
    if (!fileName) return "https://via.placeholder.com/150?text=No+Cover";
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };

  const formatMangaData = (dataArray) => {
    return dataArray.map((manga) => {
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
  };

  useEffect(() => {
    fetchRandomManga(false);
  }, []);

  async function fetchRandomManga(isLoadMore = false) {
    const currentOffset = isLoadMore ? offset + LIMIT : 0;
    
    if (!isLoadMore) {
      setLoading(true);
      setError(null);
      setManga([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/manga?limit=${LIMIT}&offset=${currentOffset}&contentRating[]=safe&includes[]=cover_art`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch manga: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const formattedData = formatMangaData(data.data);

        if (isLoadMore) {
          setManga((prev) => [...prev, ...formattedData]);
        } else {
          setManga(formattedData);
        }
        
        setOffset(currentOffset);
        setHasMore(currentOffset + data.data.length < data.total);
      } else {
        if (!isLoadMore) setError("No manga available at this time. Please try again later.");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching manga:", err);
      if (!isLoadMore) setError("Failed to load manga. Please try again later.");
    } finally {
      if (!isLoadMore) setLoading(false);
      else setLoadingMore(false);
    }
  }

  const handleSearch = (query) => {
    if (!query) {
      setSearchResults(null);
      setSearchQuery("");
      setOffset(0);
      setHasMore(true);
      return;
    }
    
    setSearchQuery(query);
    executeSearch(query, false);
  };

  async function executeSearch(query, isLoadMore = false) {
    const currentOffset = isLoadMore ? offset + LIMIT : 0;

    if (!isLoadMore) {
      setLoading(true);
      setError(null);
      setSearchResults([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/manga?title=${encodeURIComponent(
          query
        )}&limit=${LIMIT}&offset=${currentOffset}&includes[]=cover_art&contentRating[]=safe`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const formattedResults = formatMangaData(data.data);

        if (isLoadMore) {
          setSearchResults((prev) => [...prev, ...formattedResults]);
        } else {
          setSearchResults(formattedResults);
        }
        
        setOffset(currentOffset);
        setHasMore(currentOffset + data.data.length < data.total);
      } else {
         if (!isLoadMore) setSearchResults([]);
         setHasMore(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      if (!isLoadMore) setError("Failed to perform search. Please try again.");
    } finally {
      if (!isLoadMore) setLoading(false);
      else setLoadingMore(false);
    }
  }

  const handleLoadMore = () => {
    if (searchQuery) {
      executeSearch(searchQuery, true);
    } else {
      fetchRandomManga(true);
    }
  };

  const displayedManga = searchResults !== null ? searchResults : manga;

  return (
    <div className="browse-page">
      <h1>Browse Manga</h1>

      <div className="browse-controls">
        <SearchBox onSearch={handleSearch} />

        {searchResults !== null && (
          <button
            className="clear-search-btn"
            onClick={() => handleSearch("")}
          >
            Clear Search Results
          </button>
        )}
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-btn" onClick={() => {
               if (searchQuery) executeSearch(searchQuery, false);
               else fetchRandomManga(false);
            }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader message={searchQuery ? "Searching manga..." : "Loading manga..."} />
      ) : (
        <>
          {!error && (
            <>
              {searchResults !== null && (
                <p className="search-results-count">
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
              )}

              {displayedManga.length > 0 ? (
                <>
                  <MangaGrid manga={displayedManga} fromPage="/browse" />
                  
                  {hasMore && (
                    <div className="load-more-container">
                      <button 
                        className="load-more-btn" 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-results">
                  <p>No manga found matching your search.</p>
                  <button className="browse-btn" onClick={() => handleSearch("")}>
                    Back to Browse
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
