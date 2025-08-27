import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/MangaDetailPage.css";
import Loader from "../components/Loader";
import { useScroll } from "../contexts/ScrollContext";

function MangaDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollToTop } = useScroll();
  const mangaFromProps = location.state?.manga;

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to determine where to navigate back to
  const getBackDestination = () => {
    // Check if we came from a specific page via state
    if (location.state?.fromPage) {
      return location.state.fromPage;
    }

    // Check if we came from browse or popular pages using window history
    if (window.history.length > 1) {
      const referrer = document.referrer;
      if (referrer.includes("/browse")) {
        return "/browse";
      } else if (referrer.includes("/popular")) {
        return "/popular";
      }
    }

    // Default to browse page as it's most likely where manga discovery happens
    return "/browse";
  };

  const handleBackNavigation = () => {
    scrollToTop("auto");
    const destination = getBackDestination();
    navigate(destination);
  };

  useEffect(() => {
    console.log("MangaDetailPage - Starting fetch for ID:", id);
    setLoading(true);
    setError(null);

    if (mangaFromProps) {
      console.log("MangaDetailPage - Using manga from props:", mangaFromProps);
      setManga(mangaFromProps);
    }

    // Run both fetches and only set loading to false when both are done
    Promise.all([fetchMangaDetails(id), fetchChapters(id)]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const fetchMangaDetails = async (mangaId) => {
    try {
      console.log("Fetching manga details for ID:", mangaId);

      // Add retry logic and better error handling
      let response;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          response = await fetch(
            `${
              import.meta.env.VITE_BASE_URL
            }/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) break;

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
          retryCount++;
          console.warn(`Attempt ${retryCount} failed:`, err.message);

          if (retryCount === maxRetries) throw err;

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      const data = await response.json();

      // Enhanced validation
      if (!data || !data.data || !data.data.id) {
        throw new Error("Invalid or incomplete data from API");
      }

      const mangaData = data.data;

      // More robust relationship finding
      const coverRel = mangaData.relationships?.find(
        (rel) => rel.type === "cover_art"
      );
      const coverFile = coverRel?.attributes?.fileName;

      const authorRel = mangaData.relationships?.find(
        (rel) => rel.type === "author"
      );
      const artistRel = mangaData.relationships?.find(
        (rel) => rel.type === "artist"
      );

      // Better author name extraction
      let authorName = "Unknown Author";
      if (authorRel?.attributes?.name) {
        authorName = authorRel.attributes.name;
      } else if (artistRel?.attributes?.name) {
        authorName = artistRel.attributes.name;
      }

      // Enhanced title extraction
      let title = "Untitled Manga";
      if (mangaData.attributes?.title) {
        // Try multiple language fallbacks
        title =
          mangaData.attributes.title.en ||
          mangaData.attributes.title["en-us"] ||
          mangaData.attributes.title.ja ||
          mangaData.attributes.title["ja-ro"] ||
          Object.values(mangaData.attributes.title)[0] ||
          title;
      }

      // Enhanced description extraction
      let description = "No description available";
      if (mangaData.attributes?.description) {
        description =
          mangaData.attributes.description.en ||
          mangaData.attributes.description["en-us"] ||
          Object.values(mangaData.attributes.description)[0] ||
          description;
      }

      // More robust genre extraction
      let genres = [];
      if (
        mangaData.attributes?.tags &&
        Array.isArray(mangaData.attributes.tags)
      ) {
        genres = mangaData.attributes.tags
          .filter(
            (tag) => tag?.attributes?.group === "genre" && tag?.attributes?.name
          )
          .map((tag) => {
            return (
              tag.attributes.name.en ||
              Object.values(tag.attributes.name)[0] ||
              null
            );
          })
          .filter((name) => name && name.trim()); // Remove null/empty values
      }

      const completeManga = {
        id: mangaData.id,
        title: title.trim(),
        description: description.trim(),
        coverImage: coverFile
          ? `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFile}`
          : "https://via.placeholder.com/300x400?text=No+Cover",
        author: authorName.trim(),
        status: mangaData.attributes?.status || "Unknown",
        genres: genres,
      };

      console.log("Successfully processed manga:", completeManga);
      setManga(completeManga);
    } catch (err) {
      console.error("Error fetching manga details:", err);

      // If we already have some manga data from props, keep it
      if (!manga && !mangaFromProps) {
        setError(`Failed to load manga details: ${err.message}`);
      }
    }
    // Remove the finally block since we're handling loading state in useEffect
  };

  const fetchChapters = async (mangaId) => {
    try {
      console.log("Fetching chapters for manga ID:", mangaId);

      // Simplified but more reliable chapter fetching
      let allChapters = [];
      let offset = 0;
      const limit = 100;
      let hasMoreChapters = true;

      // Try simplified approach first (more likely to work)
      while (hasMoreChapters && offset < 500) {
        // Reduced cap for better performance
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed?` +
            `translatedLanguage[]=en&` +
            `order[chapter]=asc&` +
            `limit=${limit}&offset=${offset}&` +
            `contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
        );

        if (!response.ok) {
          console.warn(
            `Failed to fetch chapters at offset ${offset}:`,
            response.status
          );

          // If first batch fails, try even simpler fallback
          if (offset === 0) {
            console.log("Trying simplified chapter fetch method...");
            return await fetchChaptersFallback(mangaId);
          }
          break;
        }

        const data = await response.json();

        if (
          !data ||
          !data.data ||
          !Array.isArray(data.data) ||
          data.data.length === 0
        ) {
          hasMoreChapters = false;
          break;
        }

        // Filter and process chapters with less restrictive filtering
        const batchChapters = data.data
          .filter((chapter) => {
            return (
              chapter &&
              chapter.attributes &&
              chapter.attributes.translatedLanguage === "en"
              // Removed pages filter - let all chapters through
            );
          })
          .map((chapter) => ({
            id: chapter.id,
            number: chapter.attributes.chapter || "N/A",
            title:
              chapter.attributes.title ||
              `Chapter ${chapter.attributes.chapter || "N/A"}`,
            published: new Date(
              chapter.attributes.publishAt
            ).toLocaleDateString(),
            volume: chapter.attributes.volume || null,
            pages: chapter.attributes.pages || 0,
            scanlationGroup:
              chapter.relationships?.find(
                (rel) => rel.type === "scanlation_group"
              )?.attributes?.name || "Unknown",
          }));

        allChapters = allChapters.concat(batchChapters);

        // Check if we have more chapters to fetch
        if (data.data.length < limit) {
          hasMoreChapters = false;
        } else {
          offset += limit;
        }
      }

      // If no chapters found with simplified method, try fallback
      if (allChapters.length === 0) {
        console.log(
          "No chapters found with simplified method, trying fallback..."
        );
        return await fetchChaptersFallback(mangaId);
      }

      // Remove duplicates and sort by chapter number
      const uniqueChapters = allChapters.reduce((acc, current) => {
        const existing = acc.find(
          (chapter) =>
            chapter.number === current.number &&
            chapter.volume === current.volume
        );

        if (!existing) {
          acc.push(current);
        } else if (current.pages > existing.pages) {
          // Keep the chapter with more pages if duplicate
          const index = acc.indexOf(existing);
          acc[index] = current;
        }

        return acc;
      }, []);

      // Sort chapters properly (handle both numeric and string chapter numbers)
      uniqueChapters.sort((a, b) => {
        const aNum = parseFloat(a.number) || 0;
        const bNum = parseFloat(b.number) || 0;

        // First sort by volume if available
        if (a.volume && b.volume) {
          const aVol = parseFloat(a.volume) || 0;
          const bVol = parseFloat(b.volume) || 0;
          if (aVol !== bVol) return aVol - bVol;
        }

        // Then sort by chapter number
        return aNum - bNum;
      });

      console.log(
        `Found ${uniqueChapters.length} unique chapters for manga ${mangaId}`
      );
      setChapters(uniqueChapters);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      console.log("Chapter fetch error details:", {
        mangaId,
        errorMessage: err.message,
        errorStack: err.stack,
      });
      console.log("Trying fallback chapter fetch method...");
      await fetchChaptersFallback(mangaId);
    }
    // Remove the finally block since we're handling loading state in useEffect
  };

  // Fallback method with simplest possible parameters
  const fetchChaptersFallback = async (mangaId) => {
    try {
      console.log("Using fallback chapter fetch for manga ID:", mangaId);

      // Try multiple fallback strategies
      const fallbackUrls = [
        // Most basic - just get chapters for the manga
        `${
          import.meta.env.VITE_BASE_URL
        }/manga/${mangaId}/feed?translatedLanguage[]=en&limit=500`,
        // Even more basic - no language filter
        `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed?limit=500`,
        // Simplest possible
        `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed`,
      ];

      for (let i = 0; i < fallbackUrls.length; i++) {
        try {
          console.log(`Trying fallback URL ${i + 1}:`, fallbackUrls[i]);
          const response = await fetch(fallbackUrls[i]);

          if (!response.ok) {
            console.warn(
              `Fallback ${i + 1} failed with status:`,
              response.status
            );
            continue;
          }

          const data = await response.json();

          if (!data || !data.data || !Array.isArray(data.data)) {
            console.warn(`Fallback ${i + 1} returned no data`);
            continue;
          }

          const chapterList = data.data
            .filter((chapter) => {
              // Very lenient filtering
              return (
                chapter &&
                chapter.attributes &&
                chapter.id &&
                // Prefer English but don't require it if none found
                (chapter.attributes.translatedLanguage === "en" || i > 0)
              );
            })
            .map((chapter) => ({
              id: chapter.id,
              number: chapter.attributes.chapter || "N/A",
              title:
                chapter.attributes.title ||
                `Chapter ${chapter.attributes.chapter || "N/A"}`,
              published: chapter.attributes.publishAt
                ? new Date(chapter.attributes.publishAt).toLocaleDateString()
                : "Unknown",
              volume: chapter.attributes.volume || null,
              pages: chapter.attributes.pages || 0,
              scanlationGroup: "Unknown",
            }));

          if (chapterList.length > 0) {
            console.log(
              `Fallback ${i + 1} found ${
                chapterList.length
              } chapters for manga ${mangaId}`
            );
            setChapters(chapterList);
            return;
          }
        } catch (err) {
          console.warn(`Fallback ${i + 1} threw error:`, err);
        }
      }

      // If all fallbacks failed
      console.log("All fallback methods failed");
      setChapters([]);
    } catch (err) {
      console.error("Fallback chapter fetch failed completely:", err);
      setChapters([]);
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
      <button className="back-button" onClick={handleBackNavigation}>
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
                  <div className="chapter-number">
                    {chapter.volume && `Vol. ${chapter.volume} `}
                    Chapter {chapter.number}
                  </div>
                  <div className="chapter-title">{chapter.title}</div>
                  <div className="chapter-meta">
                    <span className="chapter-date">{chapter.published}</span>
                    {chapter.pages > 0 && (
                      <span className="chapter-pages">
                        {chapter.pages} pages
                      </span>
                    )}
                  </div>
                  <div className="chapter-group">{chapter.scanlationGroup}</div>
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
              <li>The manga might be licensed and removed from MangaDex</li>
              <li>
                Try checking the manga directly on MangaDx for availability
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaDetailPage;
