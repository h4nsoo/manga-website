import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import MangaGrid from "../components/MangaGrid";
import "../styles/HomePage.css";
import Slider from "../components/Slider";

function HomePage() {

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRandomManga();
  }, []);

  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return "Untitled Manga";
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  async function fetchRandomManga() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL}/manga?limit=18&includes[]=cover_art&contentRating[]=safe`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch manga: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setMangaList([]);
        setLoading(false);
        return;
      }

      const processedManga = data.data.map((manga) => {
        const coverRelationship = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );

        const title =
          manga.attributes.title.en ||
          Object.values(manga.attributes.title)[0] ||
          "Untitled Manga";

        let coverImage = "https://placehold.co/600x400";
        if (
          coverRelationship &&
          coverRelationship.attributes &&
          coverRelationship.attributes.fileName
        ) {
          coverImage = `https://uploads.mangadex.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
        }

        return {
          id: manga.id,
          title: truncateTitle(title),
          originalTitle: title,
          coverImage: coverImage,
        };
      });

      setMangaList(processedManga);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching manga:", err);
      setError(`Failed to load manga: ${err.message}`);
      setLoading(false);
    }
  }

  const handleRetry = () => {
    fetchRandomManga();
  };

  if (error) {
    return <ErrorMessage message={error} retryAction={handleRetry} />;
  }

  return (
    <div className="home-page">
      <Slider />

      <section className="quick-categories">
        <div className="category-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h3>Latest Updates</h3>
          <Link to="/latest" className="category-link">
            View All
          </Link>
        </div>

        <div className="category-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h3>Popular Series</h3>
          <Link to="/popular" className="category-link">
            View All
          </Link>
        </div>

        <div className="category-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <h3>Bookmarks</h3>
          <Link to="/bookmarks" className="category-link">
            View All
          </Link>
        </div>

        <div className="category-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
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
          <h3>Browse All</h3>
          <Link to="/browse" className="category-link">
            View All
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Manga</h2>
          <Link to="/browse" className="see-all-link">
            See All
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
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {loading ? (
          <Loader text="Loading manga..." />
        ) : (
          <MangaGrid
            manga={mangaList}
            emptyMessage="No featured manga found. Try refreshing the page."
          />
        )}
      </section>
    </div>
  );
}

export default HomePage;
