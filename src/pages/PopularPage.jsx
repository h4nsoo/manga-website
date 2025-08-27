import { useEffect, useState } from "react";
import MangaGrid from "../components/MangaGrid";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/PopularPage.css";

function PopularPage() {
  // Prefer env API, fall back to MangaDex official API to avoid 400s on unsupported params
  const API = import.meta.env.VITE_BASE_URL || "https://api.mangadex.org";
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopular();
  }, []);

  const getCoverImageUrl = (mangaId, fileName) => {
    if (!fileName) return "https://via.placeholder.com/300x400?text=No+Cover"; // placeholder
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };

  async function hasEnglishChapters(mangaId, minCount = 1) {
    try {
      const res = await fetch(
        `${API}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=${minCount}&contentRating[]=safe&contentRating[]=suggestive`
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
      // Most read recently: approximate by most-followed among recently updated series
      const DAYS = 30;
      const sinceISO =
        new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000)
          .toISOString()
          .split(".")[0] + "Z"; // trim ms to be strict

      let items = [];

      // Primary attempt: recently updated + follows
      const primaryUrl = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&hasAvailableChapters=true&availableTranslatedLanguage[]=en&updatedAtSince=${encodeURIComponent(
        sinceISO
      )}&order[followedCount]=desc`;

      try {
        const res = await fetch(primaryUrl);
        if (res.ok) {
          const data = await res.json();
          items = data?.data || [];
        } else {
          const txt = await res.text().catch(() => "");
          console.warn("Popular primary fetch failed:", res.status, txt);
        }
      } catch (e) {
        console.warn("Popular primary fetch error:", e);
      }

      // Fallback 1: latest uploaded chapter sorting
      if (!items.length) {
        const fb1Url = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[latestUploadedChapter]=desc`;
        try {
          const res = await fetch(fb1Url);
          if (res.ok) {
            const data = await res.json();
            items = data?.data || [];
          } else {
            const txt = await res.text().catch(() => "");
            console.warn("Popular fb1 failed:", res.status, txt);
          }
        } catch (e) {
          console.warn("Popular fb1 error:", e);
        }
      }

      // Fallback 2: overall most-followed (no recency constraint)
      if (!items.length) {
        const fb2Url = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[followedCount]=desc`;
        try {
          const res = await fetch(fb2Url);
          if (res.ok) {
            const data = await res.json();
            items = data?.data || [];
          } else {
            const txt = await res.text().catch(() => "");
            console.warn("Popular fb2 failed:", res.status, txt);
          }
        } catch (e) {
          console.warn("Popular fb2 error:", e);
        }
      }

      if (!items.length) {
        throw new Error(
          "Failed to fetch popular manga: 0 results after fallbacks"
        );
      }

      const checks = await Promise.allSettled(
        items.map((m) => hasEnglishChapters(m.id, 1))
      );

      let processed = [];
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
          followedCount: m.attributes.followedCount || 0,
        });
      }

      // De-duplicate by ID (in case of overlaps across fallbacks)
      const seen = new Set();
      processed = processed.filter((x) =>
        seen.has(x.id) ? false : (seen.add(x.id), true)
      );

      // Ensure strongest “most read” signal by sorting by follows desc (in case fallback path was used)
      processed.sort((a, b) => (b.followedCount || 0) - (a.followedCount || 0));
      // Trim to a sane amount
      processed = processed.slice(0, 40);

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
      <p className="subtitle">Most read recently (last 30 days).</p>
      {loading ? (
        <Loader text="Loading popular series..." />
      ) : (
        <MangaGrid
          manga={manga}
          emptyMessage="No popular manga available right now."
          fromPage="/popular"
        />
      )}
    </div>
  );
}

export default PopularPage;
