import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import GenresPage from './pages/GenresPage'
import GenreResultsPage from './pages/GenreResultPage'
import FavoritesPage from './pages/FavoritesPage'
import MangaDetailPage from './pages/MangaDetailPage'
import ChapterReaderPage from './pages/ChapterReaderPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="genres" element={<GenresPage />} />
        <Route path="genres/:genreId" element={<GenreResultsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="manga/:id" element={<MangaDetailPage />} />
        <Route path="chapter/:chapterId" element={<ChapterReaderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
