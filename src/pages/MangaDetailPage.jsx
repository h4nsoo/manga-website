import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/MangaDetailPage.css";
import Loader from "../components/Loader";

function MangaDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mangaFromProps = location.state?.manga;

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (mangaFromProps) {
      setManga(mangaFromProps);
    }

    fetchMangaDetails(id);
    fetchChapters(id);
  }, [id]); 

  const fetchMangaDetails = async (mangaId) => {
    try {
      console.log("Fetching manga details for ID:", mangaId);
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch manga details");
      }

      const data = await response.json();


      if (!data || !data.data) {
        throw new Error("Invalid data format from API");
      }

      const mangaData = data.data;

      const coverRel = mangaData.relationships?.find(
        (rel) => rel.type === "cover_art"
      );
      const coverFile = coverRel?.attributes?.fileName;

      const authorRel = mangaData.relationships?.find(
        (rel) => rel.type === "author"
      );
      const authorName = authorRel?.attributes?.name || "Unknown Author";

      let title = "Untitled Manga";
      if (mangaData.attributes?.title) {
        title =
          mangaData.attributes.title.en ||
          Object.values(mangaData.attributes.title)[0] ||
          title;
      }

      let description = "No description available";
      if (mangaData.attributes?.description) {
        description =
          mangaData.attributes.description.en ||
          Object.values(mangaData.attributes.description)[0] ||
          description;
      }

      let genres = [];
      if (
        mangaData.attributes?.tags &&
        Array.isArray(mangaData.attributes.tags)
      ) {
        genres = mangaData.attributes.tags
          .filter((tag) => tag.attributes?.group === "genre")
          .map((tag) => {
            if (tag.attributes?.name) {
              return (
                tag.attributes.name.en ||
                Object.values(tag.attributes.name)[0] ||
                ""
              );
            }
            return "";
          })
          .filter((name) => name);
      }

      const completeManga = {
        id: mangaData.id,
        title: title,
        description: description,
        coverImage: coverFile
          ? `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFile}`
          : "https://via.placeholder.com/300x400?text=No+Cover",
        author: authorName,
        status: mangaData.attributes?.status || "Unknown",
        genres: genres,
      };

      setManga(completeManga);
    } catch (err) {
      console.error("Error fetching manga details:", err);
      if (!manga) {
        setError("Failed to load manga details");
      }
    } finally {

      if (chapters.length > 0 || error) {
        setLoading(false);
      }
    }
  };

  const fetchChapters = async (mangaId) => {
    try {
      console.log("Fetching chapters for manga ID:", mangaId);
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chapters");
      }

      const data = await response.json();

      if (!data || !data.data || !Array.isArray(data.data)) {
        console.log("No chapters found");
        setChapters([]);
        setLoading(false);
        return;
      }


      const chapterList = data.data
        .filter((chapter) => chapter && chapter.attributes)
        .map((chapter) => ({
          id: chapter.id,
          number: chapter.attributes.chapter || "N/A",
          title:
            chapter.attributes.title ||
            `Chapter ${chapter.attributes.chapter || "N/A"}`,
          published: new Date(
            chapter.attributes.publishAt
          ).toLocaleDateString(),
        }));

      setChapters(chapterList);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setChapters([]); 
    } finally {

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader />
        <p>Loading manga details...</p>
      </div>
    );
  }

  if (error && !manga) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="error-container">
        <p>Unable to display manga information</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="manga-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="manga-header">
        <img className="manga-cover" src={manga.coverImage} alt={manga.title} />
        <div className="manga-info">
          <h1>{manga.title}</h1>
          <p>
            <strong>Author:</strong> {manga.author}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {manga.status && typeof manga.status === "string"
              ? manga.status.charAt(0).toUpperCase() + manga.status.slice(1)
              : "Unknown"}
          </p>
          <div className="genres">
            {manga.genres && manga.genres.length > 0 ? (
              manga.genres.map((genre) => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))
            ) : (
              <span className="genre-tag">No genres listed</span>
            )}
          </div>
        </div>
      </div>

      <div className="manga-description">
        <h2>Description</h2>
        <p>{manga.description}</p>
      </div>

      <div className="manga-chapters-section">
        <h2>Chapters</h2>
        {chapters.length > 0 ? (
          <div className="chapters-grid">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="chapter-card">
                <Link
                  to={`/manga/${manga.id}/chapter/${chapter.id}`}
                  state={{ manga, chapter }}
                  className="chapter-link"
                >
                  <div className="chapter-number">Chapter {chapter.number}</div>
                  <div className="chapter-title">{chapter.title}</div>
                  <div className="chapter-date">{chapter.published}</div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No chapters available for this manga. This could be because:</p>
            <ul>
              <li>No English translations exist in the database</li>
              <li>The chapters may be restricted or unavailable</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaDetailPage;
