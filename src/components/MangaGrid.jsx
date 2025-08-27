import React from "react";
import MangaCard from "./MangaCard";
import "../styles/MangaGrid.css";

function MangaGrid({
  manga,
  emptyMessage = "No manga found. Try refreshing the page.",
  fromPage = "/",
}) {
  if (!manga || manga.length === 0) {
    return <p className="no-results">{emptyMessage}</p>;
  }

  return (
    <div className="manga-grid">
      {manga.map((item) => (
        <MangaCard key={item.id} manga={item} fromPage={fromPage} />
      ))}
    </div>
  );
}

export default MangaGrid;
