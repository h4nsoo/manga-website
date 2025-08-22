import { useEffect, useState } from "react";
import MangaGrid from "../components/MangaGrid";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/PopularPage.css";

function PopularPage() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoverImageUrl = (mangaId, fileName) => {
    if (!fileName) return "https://via.placeholder.com/300x400?text=No+Cover";
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };

  async function hasEnglishChapters(mangaId, minCount = 1) {
    try {
      const res = await fetch(
        `${BASE_URL}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=${minCount}&contentRating[]=safe&contentRating[]=suggestive`
      );
      if (!res.ok) return false;
      const json = await res.json();
      return Array.isArray(json.data) && json.data.length >= minCount;
    } catch (e) {
      console.warn("hasEnglishChapters check failed for", mangaId, e);
      return false;
    }
  }

  async function fetchPopular() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/manga?limit=40&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&hasAvailableChapters=true&availableTranslatedLanguage[]=en`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch popular manga: ${response.status}`);
      }

      const data = await response.json();
      const items = data?.data || [];

      // Verify each item has at least 1 EN chapter in parallel
      const checks = await Promise.allSettled(
        items.map((m) => hasEnglishChapters(m.id, 1))
      );

      const processed = [];
      for (let i = 0; i < items.length; i++) {
        const ok = checks[i].status === "fulfilled" && checks[i].value === true;
        if (!ok) continue;

        const m = items[i];
        const coverRel = m.relationships.find((r) => r.type === "cover_art");
        const coverFile = coverRel?.attributes?.fileName || null;
        const title =
          m.attributes.title?.en ||
          (m.attributes.title && Object.values(m.attributes.title)[0]) ||
          "Untitled Manga";

        processed.push({
          id: m.id,
          title,
          coverImage: getCoverImageUrl(m.id, coverFile),
          description:
            m.attributes.description?.en ||
            (typeof m.attributes.description === "object"
              ? Object.values(m.attributes.description || {})[0]
              : "") ||
            "No description available",
        });
      }

      setManga(processed);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load popular manga");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="popular-page">
        <h1>Popular Series</h1>
        <ErrorMessage message={error} retryAction={fetchPopular} />
      </div>
    );
  }

  return (
    <div className="popular-page">
      <h1>Popular Series</h1>
      <p className="subtitle">
        Most followed series with available English chapters.
      </p>
      {loading ? (
        <Loader text="Loading popular series..." />
      ) : (
        <MangaGrid
          manga={manga}
          emptyMessage="No popular manga available right now."
        />
      )}
    </div>
  );
}

export default PopularPage;
