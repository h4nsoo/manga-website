import React, { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import MangaDetailPage from "./pages/MangaDetailPage";
import ChapterReaderPage from "./pages/ChapterReaderPage";
import NotFoundPage from "./pages/NotFoundPage";
import PopularPage from "./pages/PopularPage";
import Footer from "./components/Footer";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import "./styles/App.css";

function App() {
  const simpleBarRef = useRef(null);

  return (
    <div className="app-container">
      <Navbar />
      <SimpleBar
        className="custom-scrollbar"
        autoHide={true}
        forceVisible={false}
        timeout={1500}
        ref={simpleBarRef}
      >
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/popular" element={<PopularPage />} />
            <Route path="/manga/:id" element={<MangaDetailPage />} />
            <Route
              path="/manga/:mangaId/chapter/:chapterId"
              element={<ChapterReaderPage />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </SimpleBar>
    </div>
  );
}

export default App;
