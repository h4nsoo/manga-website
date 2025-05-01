
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function BrowsePage() {
  const [manga, setManga] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => {
      setManga([
        { id: '4', title: 'Random Manga 1', coverImage: 'https://via.placeholder.com/150' },
        { id: '5', title: 'Random Manga 2', coverImage: 'https://via.placeholder.com/150' },
        { id: '6', title: 'Random Manga 3', coverImage: 'https://via.placeholder.com/150' },
      ])
      setLoading(false)
    }, 1000)
  }, [])
  
  return (
    <div className="browse-page">
      <h1>Browse Manga</h1>
      
      {loading ? (
        <p>Loading manga...</p>
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

export default BrowsePage