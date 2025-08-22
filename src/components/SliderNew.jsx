import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import "../styles/Slider.css";

const Slider = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [popularManga, setPopularManga] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularManga();

    // Auto-advance slider
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (popularManga.length || 5));
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [popularManga.length]);

  // Preflight test: check if a given manga has at least `minCount` English chapters
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
      console.log("Fetching popular manga with available chapters...");

      // First, get a larger pool of potentially popular manga with available chapters filter
      const response = await fetch(
        `${BASE_URL}/manga?limit=20&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&order[followedCount]=desc&hasAvailableChapters=true&availableTranslatedLanguage[]=en`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch popular manga: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        console.log("No manga found with enhanced search, trying fallback...");
        await fetchPopularMangaFallback();
        setLoading(false);
        return;
      }

      // Verify manga actually have chapters and process them (parallelized)
      const candidates = data.data.slice(0, 20);
      const checks = await Promise.allSettled(
        candidates.map((m) => hasEnglishChapters(m.id, 1))
      );

      const mangaWithChapters = [];
      for (
        let i = 0;
        i < candidates.length && mangaWithChapters.length < 5;
        i++
      ) {
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
          coverImage = `https://uploads.mangadx.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
        }

        // Get better description
        let description = "No description available";
        const rawDesc = manga.attributes.description;
        if (rawDesc) {
          const desc =
            rawDesc.en ||
            (typeof rawDesc === "object" ? Object.values(rawDesc)[0] : "");
          description = desc
            ? desc.length > 150
              ? desc.substring(0, 150) + "..."
              : desc
            : "No description available";
        }

        mangaWithChapters.push({
          id: manga.id,
          title,
          description,
          coverImage,
          followedCount: manga.attributes.followedCount || 0,
          status: manga.attributes.status || "unknown",
          year: manga.attributes.year || null,
        });
      }

      // Sort by followed count to ensure most popular are first
      mangaWithChapters.sort((a, b) => b.followedCount - a.followedCount);

      console.log(
        `Found ${mangaWithChapters.length} popular manga with available chapters`
      );

      if (mangaWithChapters.length > 0) {
        setPopularManga(mangaWithChapters);
      } else {
        console.log("No manga with chapters found, trying fallback...");
        await fetchPopularMangaFallback();
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching popular manga:", err);
      await fetchPopularMangaFallback();
      setLoading(false);
    }
  }

  // Fallback method with simpler parameters
  async function fetchPopularMangaFallback() {
    try {
      console.log("Using fallback method for popular manga...");
      const fallbackResponse = await fetch(
        `${BASE_URL}/manga?limit=8&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc`
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        // Re-verify fallback items have EN chapters
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
          const passed =
            checks[i].status === "fulfilled" && checks[i].value === true;
          if (!passed) continue;

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
            coverImage = `https://uploads.mangadx.org/covers/${manga.id}/${coverRelationship.attributes.fileName}`;
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
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      setPopularManga([]);
    }
  }

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularManga.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + popularManga.length) % popularManga.length
    );
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
                      state={{ manga }}
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
