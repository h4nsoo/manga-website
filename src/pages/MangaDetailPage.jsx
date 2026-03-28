import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/MangaDetailPage.css";
import Loader from "../components/Loader";
import { useScroll } from "../contexts/ScrollContext";

// Strip markdown links [text](url) → text, and clean up raw URLs
function stripMarkdown(text) {
  if (!text) return text;
  // Convert [text](url) to text
  let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove standalone bare URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/g, '');
  // Clean up leftover dashes and whitespace
  cleaned = cleaned.replace(/\s*[–—-]\s*$/gm, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

// Check if chapter title is just a repeat of the chapter number
function isRedundantTitle(title, number) {
  if (!title || !number) return true;
  const normalized = title.toLowerCase().trim();
  const chapterStr = `chapter ${number}`.toLowerCase();
  return normalized === chapterStr || normalized === number.toString();
}

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

    Promise.all([fetchMangaDetails(id), fetchChapters(id)]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const fetchMangaDetails = async (mangaId) => {
    try {
      console.log("Fetching manga details for ID:", mangaId);

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

      let authorName = "Unknown Author";
      if (authorRel?.attributes?.name) {
        authorName = authorRel.attributes.name;
      } else if (artistRel?.attributes?.name) {
        authorName = artistRel.attributes.name;
      }

      let title = "Untitled Manga";
      if (mangaData.attributes?.title) {
        title =
          mangaData.attributes.title.en ||
          mangaData.attributes.title["en-us"] ||
          mangaData.attributes.title.ja ||
          mangaData.attributes.title["ja-ro"] ||
          Object.values(mangaData.attributes.title)[0] ||
          title;
      }

      let description = "No description available";
      if (mangaData.attributes?.description) {
        description =
          mangaData.attributes.description.en ||
          mangaData.attributes.description["en-us"] ||
          Object.values(mangaData.attributes.description)[0] ||
          description;
      }

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
          .filter((name) => name && name.trim());
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

      if (!manga && !mangaFromProps) {
        setError(`Failed to load manga details: ${err.message}`);
      }
    }
  };

  const fetchChapters = async (mangaId) => {
    try {
      console.log("Fetching chapters for manga ID:", mangaId);

      // Use feed endpoint with optimized parameters
      let allChapters = [];
      let offset = 0;
      const limit = 100; // Reduced limit to prevent timeouts/errors
      let hasMoreChapters = true;
      let retryCount = 0;

      while (hasMoreChapters && offset < 10000) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed?` +
              `translatedLanguage[]=en&` +
              `order[chapter]=asc&` +
              `limit=${limit}&offset=${offset}&` +
              `contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&` +
              `includes[]=scanlation_group&includes[]=user`
          );

          if (!response.ok) {
            console.warn(
              `Failed to fetch chapters at offset ${offset}:`,
              response.status
            );

            // Retry logic for 500/503 errors
            if (
              (response.status === 500 || response.status === 503) &&
              retryCount < 3
            ) {
              console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
              retryCount++;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }

            // If first batch fails, try fallback
            if (offset === 0) {
              console.log("Trying simplified chapter fetch method...");
              return await fetchChaptersFallback(mangaId);
            }
            break;
          }

          retryCount = 0; // Reset retry count on success
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

          // Filter and process chapters
          const batchChapters = data.data
            .filter((chapter) => {
              return (
                chapter &&
                chapter.attributes &&
                chapter.attributes.translatedLanguage === "en" &&
                chapter.id
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
              scanlationGroup:
                chapter.relationships?.find(
                  (rel) => rel.type === "scanlation_group"
                )?.attributes?.name || "Unknown",
              externalUrl: chapter.attributes.externalUrl || null,
            }));

          allChapters = allChapters.concat(batchChapters);
          const total = data.total || 0;
          console.log(
            `Fetched ${batchChapters.length} chapters at offset ${offset}, total so far: ${allChapters.length} / ${total}`
          );

          // Use API's total count as the authoritative stop condition
          offset += limit;
          if (offset >= total || data.data.length === 0) {
            hasMoreChapters = false;
          } else {
            // Small delay to avoid MangaDex rate limiting
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } catch (fetchErr) {
          console.error("Error in fetch loop:", fetchErr);
          if (offset === 0) {
            return await fetchChaptersFallback(mangaId);
          }
          break;
        }
      }

      // If no chapters found with simplified method, try fallback
      if (allChapters.length === 0) {
        console.log("No chapters found with main method, trying fallback...");
        return await fetchChaptersFallback(mangaId);
      }

      // Remove duplicates and sort by chapter number
      const uniqueChapters = allChapters.reduce((acc, current) => {
        // Don't deduplicate if number is N/A
        if (current.number === "N/A") {
          acc.push(current);
          return acc;
        }

        const existing = acc.find(
          (chapter) =>
            chapter.number === current.number &&
            chapter.volume === current.volume
        );

        if (!existing) {
          acc.push(current);
        } else {
          // If duplicate, prefer the one with pages (not external)
          if (existing.pages === 0 && current.pages > 0) {
            const index = acc.indexOf(existing);
            acc[index] = current;
          }
        }

        return acc;
      }, []);

      // Sort chapters properly
      uniqueChapters.sort((a, b) => {
        const aNum = parseFloat(a.number);
        const bNum = parseFloat(b.number);

        // Handle N/A or non-numeric chapters (put them at the end)
        if (isNaN(aNum) && isNaN(bNum)) return 0;
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;

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
      console.log("Trying fallback chapter fetch method...");
      await fetchChaptersFallback(mangaId);
    }
  };

  // Fallback method with simplest possible parameters — now with pagination
  const fetchChaptersFallback = async (mangaId) => {
    try {
      console.log("Using fallback chapter fetch for manga ID:", mangaId);

      // Try multiple fallback strategies
      const fallbackBaseUrls = [
        // Most comprehensive - all content ratings + includes
        `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed?translatedLanguage[]=en&includes[]=scanlation_group`,
        // Basic with just English
        `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed?translatedLanguage[]=en`,
        // Even more basic - no language filter
        `${import.meta.env.VITE_BASE_URL}/manga/${mangaId}/feed`,
      ];

      for (let i = 0; i < fallbackBaseUrls.length; i++) {
        try {
          console.log(`Trying fallback strategy ${i + 1}...`);
          let allChapters = [];
          let offset = 0;
          const limit = 100;
          let hasMore = true;

          while (hasMore && offset < 10000) {
            const url = `${fallbackBaseUrls[i]}&limit=${limit}&offset=${offset}&order[chapter]=asc`;
            const response = await fetch(url);

            if (!response.ok) {
              console.warn(
                `Fallback ${i + 1} failed with status:`,
                response.status
              );
              break;
            }

            const data = await response.json();

            if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
              hasMore = false;
              break;
            }

            const batchChapters = data.data
              .filter((chapter) => {
                return (
                  chapter &&
                  chapter.attributes &&
                  chapter.id &&
                  (chapter.attributes.translatedLanguage === "en" || i > 1)
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
                scanlationGroup:
                  chapter.relationships?.find(
                    (rel) => rel.type === "scanlation_group"
                  )?.attributes?.name || "Unknown",
              }));

            allChapters = allChapters.concat(batchChapters);
            const total = data.total || 0;
            console.log(
              `Fallback ${i + 1}: fetched ${batchChapters.length} at offset ${offset}, total so far: ${allChapters.length} / ${total}`
            );

            offset += limit;
            if (offset >= total || data.data.length === 0) {
              hasMore = false;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }

          if (allChapters.length > 0) {
            console.log(
              `Fallback ${i + 1} found ${allChapters.length} chapters for manga ${mangaId}`
            );
            setChapters(allChapters);
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
        <p>{stripMarkdown(manga.description)}</p>
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
                  {!isRedundantTitle(chapter.title, chapter.number) && (
                    <div className="chapter-title">{chapter.title}</div>
                  )}
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
