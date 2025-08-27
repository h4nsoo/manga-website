import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import "../styles/Slider.css";

const Slider = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [popularManga, setPopularManga] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const slideIntervalRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // auto-refresh every 30 minutes

  const startAutoSlide = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    // Only start when we have items
    if ((popularManga?.length || 0) > 0) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const len = popularManga.length;
          if (!len) return prev;
          return (prev + 1) % len;
        });
      }, 5000);
    }
  };

  useEffect(() => {
    fetchPopularManga();
    startAutoSlide();
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [popularManga.length]);

  // Background auto-refresh of the popular list
  useEffect(() => {
    // kick off initial fetch if not yet loaded
    if (popularManga.length === 0 && !loading) {
      fetchPopularManga();
    }
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => {
      fetchPopularManga();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function fetchPopularManga() {
    setLoading(true);
    try {
      // All-time popular: order by followedCount desc
      let response = await fetch(
        `${BASE_URL}/manga?limit=30&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[followedCount]=desc`
      );

      if (!response.ok) {
        // Fallback: latest uploaded if primary fails
        response = await fetch(
          `${BASE_URL}/manga?limit=30&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&availableTranslatedLanguage[]=en&order[latestUploadedChapter]=desc`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch popular manga: ${response.status}`);
        }
      }

      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        await fetchPopularMangaFallback();
        setLoading(false);
        return;
      }

      const candidates = data.data.slice(0, 30);
      const checks = await Promise.allSettled(
        candidates.map((m) => hasEnglishChapters(m.id, 1))
      );

      const processed = [];
      for (let i = 0; i < candidates.length && processed.length < 5; i++) {
        const ok = checks[i].status === "fulfilled" && checks[i].value === true;
        if (!ok) continue;

        const manga = candidates[i];
        const coverRelationship = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );

        const title =
          manga.attributes.title?.en ||
          (manga.attributes.title &&
            Object.values(manga.attributes.title)[0]) ||
          "Untitled Manga";

        let coverImage = "https://placehold.co/600x900";
        if (coverRelationship?.attributes?.fileName) {
          coverImage = `https://uploads.mangadex.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
        }

        const rawDesc = manga.attributes.description;
        const shortDesc = rawDesc?.en
          ? rawDesc.en.substring(0, 120) + "..."
          : typeof rawDesc === "object" && rawDesc
          ? (Object.values(rawDesc)[0] || "").toString().substring(0, 120) +
            "..."
          : "No description available";

        processed.push({
          id: manga.id,
          title,
          description: shortDesc,
          coverImage,
        });
      }

      if (processed.length === 0) {
        await fetchPopularMangaFallback();
      } else {
        setPopularManga(processed);
        setCurrentSlide(0);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching popular manga:", err);
      await fetchPopularMangaFallback();
      setLoading(false);
    }
  }

  async function fetchPopularMangaFallback() {
    try {
      const fallbackResponse = await fetch(
        `${BASE_URL}/manga?limit=12&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc`
      );

      if (!fallbackResponse.ok) return;
      const fallbackData = await fallbackResponse.json();
      const fallbackCandidates = fallbackData.data || [];
      const checks = await Promise.allSettled(
        fallbackCandidates.map((m) => hasEnglishChapters(m.id, 1))
      );

      const processed = [];
      for (
        let i = 0;
        i < fallbackCandidates.length && processed.length < 5;
        i++
      ) {
        const ok = checks[i].status === "fulfilled" && checks[i].value === true;
        if (!ok) continue;

        const manga = fallbackCandidates[i];
        const coverRelationship = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );

        const title =
          manga.attributes.title?.en ||
          (manga.attributes.title &&
            Object.values(manga.attributes.title)[0]) ||
          "Untitled Manga";

        let coverImage = "https://placehold.co/600x900";
        if (coverRelationship?.attributes?.fileName) {
          coverImage = `https://uploads.mangadex.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
        }

        const rawDesc = manga.attributes.description;
        const shortDesc = rawDesc?.en
          ? rawDesc.en.substring(0, 120) + "..."
          : typeof rawDesc === "object" && rawDesc
          ? (Object.values(rawDesc)[0] || "").toString().substring(0, 120) +
            "..."
          : "No description available";

        processed.push({
          id: manga.id,
          title,
          description: shortDesc,
          coverImage,
        });
      }

      setPopularManga(processed);
    } catch (e) {
      console.error("Fallback fetch failed:", e);
      setPopularManga([]);
    }
  }

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    startAutoSlide();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularManga.length);
    startAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + popularManga.length) % popularManga.length
    );
    startAutoSlide();
  };

  return (
    <div className="manga-slider">
      <h1 className="slider-heading">Popular Manga</h1>

      <div className="slider-container">
        {loading ? (
          <div className="slider-loading">
            <Loader text="Loading popular manga..." />
          </div>
        ) : popularManga.length > 0 ? (
          <>
            <button
              className="slider-arrow slider-prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="slides-wrapper">
              {popularManga.map((manga, index) => (
                <div
                  key={manga.id}
                  className={`slide ${index === currentSlide ? "active" : ""}`}
                  style={{
                    transform: `translateX(${(index - currentSlide) * 100}%)`,
                    backgroundImage: `url(${manga.coverImage})`,
                  }}
                >
                  <div className="slide-content">
                    <h2>{manga.title}</h2>
                    <p>{manga.description}</p>
                    <Link
                      to={`/manga/${manga.id}`}
                      state={{ manga, fromPage: "/" }}
                      className="cssbuttons-io-button"
                    >
                      Read More
                      <div className="icon">
                        <svg
                          height="24"
                          width="24"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0h24v24H0z" fill="none"></path>
                          <path
                            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="slider-arrow slider-next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div className="slider-indicators">
              {popularManga.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${
                    index === currentSlide ? "active" : ""
                  }`}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="no-manga-message">
            <p>No popular manga found at this time.</p>
            <button onClick={fetchPopularManga} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Slider;
