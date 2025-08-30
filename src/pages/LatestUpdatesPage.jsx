import { useEffect, useState } from "react";
import MangaGrid from "../components/MangaGrid";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/LatestUpdatesPage.css";

function LatestUpdatesPage() {
  const API = import.meta.env.VITE_BASE_URL || "https://api.mangadx.org";
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestUpdates();
  }, []);

  const getCoverImageUrl = (mangaId, fileName) => {
    if (!fileName) return "https://via.placeholder.com/300x400?text=No+Cover";
    return `https://uploads.mangadx.org/covers/${mangaId}/${fileName}`;
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

  async function fetchLatestUpdates() {
    setLoading(true);
    setError(null);
    try {
      // Get manga with latest chapter updates in the last 7 days
      const DAYS = 7;
      const sinceISO =
        new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000)
          .toISOString()
          .split(".")[0] + "Z";

      let items = [];

      // Primary attempt: latest uploaded chapters
      const primaryUrl = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]=en&updatedAtSince=${encodeURIComponent(
        sinceISO
      )}&order[latestUploadedChapter]=desc`;

      try {
        const res = await fetch(primaryUrl);
        if (res.ok) {
          const data = await res.json();
          items = data?.data || [];
        } else {
          const txt = await res.text().catch(() => "");
          console.warn("Latest updates primary fetch failed:", res.status, txt);
        }
      } catch (e) {
        console.warn("Latest updates primary fetch error:", e);
      }

      // Fallback 1: recently updated manga
      if (!items.length) {
        const fb1Url = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[updatedAt]=desc`;
        try {
          const res = await fetch(fb1Url);
          if (res.ok) {
            const data = await res.json();
            items = data?.data || [];
          } else {
            const txt = await res.text().catch(() => "");
            console.warn("Latest updates fb1 failed:", res.status, txt);
          }
        } catch (e) {
          console.warn("Latest updates fb1 error:", e);
        }
      }

      // Fallback 2: created at desc (newest manga)
      if (!items.length) {
        const fb2Url = `${API}/manga?limit=60&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[createdAt]=desc`;
        try {
          const res = await fetch(fb2Url);
          if (res.ok) {
            const data = await res.json();
            items = data?.data || [];
          } else {
            const txt = await res.text().catch(() => "");
            console.warn("Latest updates fb2 failed:", res.status, txt);
          }
        } catch (e) {
          console.warn("Latest updates fb2 error:", e);
        }
      }

      if (!items.length) {
        throw new Error(
          "Failed to fetch latest updates: 0 results after fallbacks"
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
          updatedAt: m.attributes.updatedAt || m.attributes.createdAt,
        });
      }

      // De-duplicate by ID
      const seen = new Set();
      processed = processed.filter((x) =>
        seen.has(x.id) ? false : (seen.add(x.id), true)
      );

      // Sort by updated date (most recent first)
      processed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      // Limit to reasonable amount
      processed = processed.slice(0, 40);

      setManga(processed);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load latest updates");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="latest-updates-page">
        <h1>Latest Updates</h1>
        <ErrorMessage message={error} retryAction={fetchLatestUpdates} />
      </div>
    );
  }

  return (
    <div className="latest-updates-page">
      <h1>Latest Updates</h1>
      <p className="subtitle">Recently updated manga series (last 7 days)</p>
      {loading ? (
        <Loader text="Loading latest updates..." />
      ) : (
        <MangaGrid
          manga={manga}
          emptyMessage="No recent updates available right now."
          fromPage="/latest-updates"
        />
      )}
    </div>
  );
}

export default LatestUpdatesPage;
