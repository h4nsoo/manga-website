import { Link } from "react-router-dom";

function MangaCard({ manga }) {
  return (
    <Link to={`/manga/${manga.id}`} className="manga-card">
      <img src={manga.coverImage} alt={manga.title} loading="lazy" />
      <div className="manga-info">
        <h3>{manga.title}</h3>
      </div>
    </Link>
  );
}

export default MangaCard;
