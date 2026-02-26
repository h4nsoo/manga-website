import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import BackToTopButton from "./components/BackToTopButton";
import Loader from "./components/Loader";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import "./styles/App.css";
import "./styles/SmoothScroll.css";
import useScrollToTop from "./hooks/useScrollToTop";
import { useScroll } from "./contexts/ScrollContext";
import { BookmarkProvider } from "./contexts/BookmarkContext";

// Lazy load route components
const HomePage = lazy(() => import("./pages/HomePage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const MangaDetailPage = lazy(() => import("./pages/MangaDetailPage"));
const ChapterReaderPage = lazy(() => import("./pages/ChapterReaderPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const PopularPage = lazy(() => import("./pages/PopularPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const LatestUpdatesPage = lazy(() => import("./pages/LatestUpdatesPage"));

function App() {
  const { scrollRef } = useScroll();

  useScrollToTop(scrollRef);

  return (
    <BookmarkProvider>
      <div className="app-container">
        <Navbar />
        <SimpleBar
          className="custom-scrollbar"
          autoHide={true}
          forceVisible={false}
          timeout={1500}
          ref={scrollRef}
        >
          <main>
            <Suspense
              fallback={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                  }}
                >
                  <Loader />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/popular" element={<PopularPage />} />
                <Route path="/latest-updates" element={<LatestUpdatesPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/manga/:id" element={<MangaDetailPage />} />
                <Route
                  path="/manga/:mangaId/chapter/:chapterId"
                  element={<ChapterReaderPage />}
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </SimpleBar>
        <BackToTopButton />
      </div>
    </BookmarkProvider>
  );
}

export default App;
