import React, { useState } from "react";
import "../styles/SearchBox.css";

function SearchBox({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <form
      className={`search-box ${isFocused ? "focused" : ""}`}
      onSubmit={handleSubmit}
    >
      <button className="search-button" type="submit" aria-label="Search">
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
      />

      {searchTerm && (
        <button
          className="clear-button"
          type="button"
          onClick={() => {
            setSearchTerm("");
            if (onSearch) onSearch("");
          }}
          aria-label="Clear search"
        ></button>
      )}
    </form>
  );
}

export default SearchBox;
