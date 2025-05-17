import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import "../styles/Slider.css";

const Slider = () => {
  const BASE_URL = "https://api.mangadex.org";
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

  async function fetchPopularManga() {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/manga?limit=5&includes[]=cover_art&contentRating[]=safe&order[followedCount]=desc`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch popular manga: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setPopularManga([]);
        setLoading(false);
        return;
      }

      const processed = data.data.map((manga) => {
        const coverRelationship = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );

        const title =
          manga.attributes.title.en ||
          Object.values(manga.attributes.title)[0] ||
          "Untitled Manga";

        let coverImage = "https://placehold.co/600x900";
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
          description:
            manga.attributes.description?.en?.substring(0, 120) + "..." ||
            "No description available",
          coverImage: coverImage,
        };
      });

      setPopularManga(processed);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching popular manga:", err);
      setLoading(false);
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
    <section className="manga-slider">
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
                    <Link to={`/manga/${manga.id}`} className="read-more-btn">
                      Read More
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
    </section>
  );
};

export default Slider;
