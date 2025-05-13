import React, { useState } from "react";
import "../styles/SearchBox.css";

function SearchBox({ onSearch, getCoverImageUrl }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    if (onSearch) {
      setIsSearching(true);

      try {
        const response = await fetch(
          `https://api.mangadex.org/manga?title=${encodeURIComponent(
            searchTerm
          )}&limit=20&includes[]=cover_art&contentRating[]=safe`
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const formattedResults = data.data.map((item) => {

            const coverRelationship = item.relationships.find(
              (rel) => rel.type === "cover_art"
            );

            let coverFileName = null;
            if (coverRelationship && coverRelationship.attributes) {
              coverFileName = coverRelationship.attributes.fileName;
            }

            return {
              id: item.id,
              title:
                item.attributes.title.en ||
                item.attributes.title.ja ||
                Object.values(item.attributes.title)[0],
              coverImage: getCoverImageUrl(item.id, coverFileName),
            };
          });

          onSearch(formattedResults);
        } else {
          onSearch([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        onSearch([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <form
      className={`search-box ${isFocused ? "focused" : ""} ${
        isSearching ? "searching" : ""
      }`}
      onSubmit={handleSubmit}
    >
      <button
        className="search-button"
        type="submit"
        aria-label="Search"
        disabled={isSearching}
      >
        {isSearching ? (
          <div className="search-spinner"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        )}
      </button>

      <input
        type="search"
        placeholder="Search manga by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="search-input"
        aria-label="Search for manga"
        disabled={isSearching}
      />

      {searchTerm && !isSearching && (
        <button
          className="clear-button"
          type="button"
          onClick={() => {
            setSearchTerm("");
            if (onSearch) onSearch(null);
          }}
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </form>
  );
}

export default SearchBox;
