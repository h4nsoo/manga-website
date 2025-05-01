
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

function GenreResultsPage() {
  const { genreId } = useParams()
  const [manga, setManga] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => {
      setManga([
        { id: '7', title: `${genreId.charAt(0).toUpperCase() + genreId.slice(1)} Manga 1`, coverImage: 'https://via.placeholder.com/150' },
        { id: '8', title: `${genreId.charAt(0).toUpperCase() + genreId.slice(1)} Manga 2`, coverImage: 'https://via.placeholder.com/150' },
        { id: '9', title: `${genreId.charAt(0).toUpperCase() + genreId.slice(1)} Manga 3`, coverImage: 'https://via.placeholder.com/150' },
      ])
      setLoading(false)
    }, 1000)
  }, [genreId])
  
  return (
    <div className="genre-results-page">
      <h1>{genreId.charAt(0).toUpperCase() + genreId.slice(1)} Manga</h1>
      
      {loading ? (
        <p>Loading {genreId} manga...</p>
      ) : (
        <div className="manga-grid">
          {manga.map(item => (
            <Link key={item.id} to={`/manga/${item.id}`} className="manga-card">
              <img src={item.coverImage} alt={item.title} />
              <h3>{item.title}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default GenreResultsPage