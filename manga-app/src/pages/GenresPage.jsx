
import { Link } from 'react-router-dom'

function GenresPage() {
  const genres = [
    { id: 'action', name: 'Action' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'horror', name: 'Horror' },
    { id: 'romance', name: 'Romance' },
    { id: 'sci-fi', name: 'Sci-Fi' },
  ]
  
  return (
    <div className="genres-page">
      <h1>Manga Genres</h1>
      <div className="genre-grid">
        {genres.map(genre => (
          <Link key={genre.id} to={`/genres/${genre.id}`} className="genre-card">
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default GenresPage