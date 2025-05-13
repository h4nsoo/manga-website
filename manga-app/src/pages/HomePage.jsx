import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import MangaGrid from "../components/MangaGrid";
import "../styles/HomePage.css";

function HomePage() {
  const BASE_URL = "https://api.mangadex.org";

  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRandomManga();
  }, []);
  

  async function fetchRandomManga() {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching random manga...");

      const response = await fetch(
        `${BASE_URL}/manga?limit=20&includes[]=cover_art&contentRating[]=safe`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch manga: ${response.status}`);
      }

      const data = await response.json();
      console.log("Manga data:", data);

      if (!data.data || data.data.length === 0) {
        console.log("No manga data found in the response");
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
          title: title,
          coverImage: coverImage,
        };
      });

      console.log("Processed manga:", processedManga);
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
      <h1>Featured Manga</h1>

      {loading ? (
        <Loader text="Loading manga..."/>
      ) : (
        <MangaGrid
          manga={mangaList}
          emptyMessage="No featured manga found. Try refreshing the page."
        />
      )}
    </div>
  );
}

export default HomePage;
