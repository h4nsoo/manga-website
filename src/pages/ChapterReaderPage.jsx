import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/ChapterReaderPage.css";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

function ChapterReaderPage() {
  const { mangaId, chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get chapter and manga data from location state, if available
  const chapterData = location.state?.chapter;
  const mangaData = location.state?.manga;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [chapterInfo, setChapterInfo] = useState(chapterData || null);
  const [manga, setManga] = useState(mangaData || null);
  const [error, setError] = useState(null);
  const [nextChapter, setNextChapter] = useState(null);
  const [prevChapter, setPrevChapter] = useState(null);

  // References for scrolling
  const pageRefs = useRef([]);
  const readerRef = useRef(null);

  // Fetch manga data and chapter list
  useEffect(() => {
    const fetchMangaAndChapters = async () => {
      try {
        // If we don't have manga data, fetch it
        if (!mangaData) {
          const mangaResponse = await fetch(
            `${
              import.meta.env.VITE_BASE_URL
            }/manga/${mangaId}?includes[]=cover_art&includes[]=author`
          );

          if (mangaResponse.ok) {
            const mangaResult = await mangaResponse.json();
            const mangaData = mangaResult.data;

            // Extract basic manga info
            const coverRel = mangaData.relationships?.find(
              (rel) => rel.type === "cover_art"
            );
            const coverFile = coverRel?.attributes?.fileName;
            const title =
              mangaData.attributes.title.en ||
              Object.values(mangaData.attributes.title)[0] ||
              "Unknown Manga";

            setManga({
              id: mangaData.id,
              title: title,
              coverImage: coverFile
                ? `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFile}`
                : "https://via.placeholder.com/300x400?text=No+Cover",
            });
          }
        } else {
          setManga(mangaData);
        }

        // Fetch all chapters to find next/prev
        const chaptersResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_URL
          }/manga/${mangaId}/feed?translatedLanguage[]=en&order[volume]=asc&order[chapter]=asc&limit=500`
        );

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          const chapters = chaptersData.data;

          // Find current chapter index
          const currentChapterIndex = chapters.findIndex(
            (chapter) => chapter.id === chapterId
          );

          // Set next and previous chapters
          if (currentChapterIndex !== -1) {
            if (currentChapterIndex > 0) {
              const prev = chapters[currentChapterIndex - 1];
              setPrevChapter({
                id: prev.id,
                number: prev.attributes.chapter || "N/A",
                title:
                  prev.attributes.title || `Chapter ${prev.attributes.chapter}`,
              });
            }

            if (currentChapterIndex < chapters.length - 1) {
              const next = chapters[currentChapterIndex + 1];
              setNextChapter({
                id: next.id,
                number: next.attributes.chapter || "N/A",
                title:
                  next.attributes.title || `Chapter ${next.attributes.chapter}`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching manga or chapters:", err);
      }
    };

    fetchMangaAndChapters();
  }, [mangaId, mangaData, chapterId]);

  // Fetch chapter pages
  useEffect(() => {
    const fetchChapterPages = async () => {
      try {
        setLoading(true);

        let chapterToUse = chapterData;
        if (!chapterToUse) {
          const chapterResponse = await fetch(
            `${import.meta.env.VITE_BASE_URL}/chapter/${chapterId}`
          );

          if (!chapterResponse.ok) {
            throw new Error("Failed to fetch chapter data");
          }

          const chapterResult = await chapterResponse.json();
          chapterToUse = {
            id: chapterResult.data.id,
            number: chapterResult.data.attributes.chapter || "N/A",
            title:
              chapterResult.data.attributes.title ||
              `Chapter ${chapterResult.data.attributes.chapter || "N/A"}`,
          };
        }
        setChapterInfo(chapterToUse);

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/at-home/server/${chapterId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chapter pages");
        }

        const data = await response.json();

        const baseUrl = data.baseUrl;
        const chapterHash = data.chapter.hash;
        const pageFilenames = data.chapter.data;

        const pageUrls = pageFilenames.map(
          (filename) => `${baseUrl}/data/${chapterHash}/${filename}`
        );

        pageRefs.current = Array(pageUrls.length);

        setPages(pageUrls);
        setCurrentPageIndex(0);
        setLoading(false);

        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Error loading chapter:", err);
        setError("Failed to load chapter. Please try again.");
        setLoading(false);
      }
    };

    fetchChapterPages();
  }, [chapterId, chapterData]);

  const goToNextChapter = () => {
    if (nextChapter) {
      navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`, {
        state: { manga, chapter: nextChapter },
      });
    }
  };

  const goToPrevChapter = () => {
    if (prevChapter) {
      navigate(`/manga/${mangaId}/chapter/${prevChapter.id}`, {
        state: { manga, chapter: prevChapter },
      });
    }
  };

  if (loading) {
    return (
      <div className="chapter-loading">
        <Loader />
        <p>Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chapter-error">
        <ErrorMessage message={error} />
        <button onClick={() => navigate(`/manga/${mangaId}`)}>
          Back to Manga
        </button>
      </div>
    );
  }

  return (
    <div className="chapter-reader-container">
      <div className="reader-header">
        <button
          className="back-button"
          onClick={() => navigate(`/manga/${mangaId}`)}
        >
          ← Back
        </button>

        <div className="chapter-info">
          <h1 className="manga-title">{manga?.title}</h1>
          <h2 className="chapter-title">
            Chapter {chapterInfo?.number}{" "}
            {chapterInfo?.title ? `- ${chapterInfo.title}` : ""}
          </h2>
        </div>
      </div>

      <div className="chapter-navigation">
        <button
          onClick={goToPrevChapter}
          disabled={!prevChapter}
          className="chapter-nav-button"
        >
          ← Previous Chapter
        </button>
        <button
          onClick={goToNextChapter}
          disabled={!nextChapter}
          className="chapter-nav-button"
        >
          Next Chapter →
        </button>
      </div>

      {/* Reader content */}
      <div className="reader-content" ref={readerRef}>
        {pages.map((page, index) => (
          <div
            key={index}
            className="page-container"
            ref={(el) => (pageRefs.current[index] = el)}
          >
            <img
              src={page}
              alt={`Page ${index + 1}`}
              className="page-image"
              loading={index < 3 ? "eager" : "lazy"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x1200?text=Image+Not+Available";
              }}
            />
          </div>
        ))}
      </div>

      <div className="reader-footer">
        <button
          onClick={goToPrevChapter}
          disabled={!prevChapter}
          className="chapter-nav-button"
        >
          ← Previous Chapter
        </button>
        <button
          onClick={goToNextChapter}
          disabled={!nextChapter}
          className="chapter-nav-button"
        >
          Next Chapter →
        </button>
      </div>
    </div>
  );
}

export default ChapterReaderPage;
