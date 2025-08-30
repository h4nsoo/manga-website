import React from "react";
import { Link } from "react-router-dom";
import BookmarkButton from "./BookmarkButton";
import "../styles/MangaCard.css";

function MangaCard({ manga, fromPage = "/" }) {
  return (
    <div className="manga-card">
      <Link
        to={`/manga/${manga.id}`}
        state={{ manga, fromPage }}
        className="manga-card-link"
      >
        <div className="manga-card-image-container">
          <img
            src={manga.coverImage}
            alt={manga.title}
            className="manga-card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/200x300?text=No+Cover";
            }}
          />
        </div>
        <h3
          className="manga-card-title"
          title={manga.originalTitle || manga.title}
        >
          {manga.title}
        </h3>
      </Link>
      <BookmarkButton manga={manga} />
    </div>
  );
}

export default MangaCard;
