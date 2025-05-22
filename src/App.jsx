import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import MangaDetailPage from "./pages/MangaDetailPage";
import ChapterReaderPage from "./pages/ChapterReaderPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/Footer";
import "./styles/App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/manga/:id" element={<MangaDetailPage />} />
          <Route
            path="/manga/:mangaId/chapter/:chapterId"
            element={<ChapterReaderPage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
