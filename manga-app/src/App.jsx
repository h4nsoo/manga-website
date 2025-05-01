import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import GenresPage from "./pages/GenresPage";
import GenreResultsPage from "./pages/GenreResultPage";
import MangaDetailPage from "./pages/MangaDetailPage";
import ChapterReaderPage from "./pages/ChapterReaderPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/genres" element={<GenresPage />} />
          <Route path="/genres/:genreId" element={<GenreResultsPage />} />
          <Route path="/manga/:id" element={<MangaDetailPage />} />
          <Route path="/chapter/:chapterId" element={<ChapterReaderPage />} />
    
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
