import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

function HomePage() {
  const [latestManga, setLatestManga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLatestManga([
        {
          id: "1",
          title: "Manga Title 1",
          coverImage: "https://via.placeholder.com/150",
        },
        {
          id: "2",
          title: "Manga Title 2",
          coverImage: "https://via.placeholder.com/150",
        },
        {
          id: "3",
          title: "Manga Title 3",
          coverImage: "https://via.placeholder.com/150",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="home-page">
      <h1>Latest Releases</h1>

      {loading ? (
        <Loader text="Loading latest manga..." size="large" />
      ) : (
        <div className="manga-grid">
          {latestManga.map((manga) => (
            <Link
              key={manga.id}
              to={`/manga/${manga.id}`}
              className="manga-card"
            >
              <img src={manga.coverImage} alt={manga.title} />
              <h3>{manga.title}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
