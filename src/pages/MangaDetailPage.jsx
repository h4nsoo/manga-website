
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

function MangaDetailPage() {
  const { id } = useParams()
  const [manga, setManga] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => {
      setManga({
        id,
        title: `Manga Title ${id}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies lacinia, nisl nisl aliquet nisl.',
        coverImage: 'https://via.placeholder.com/300x400',
        author: 'Author Name',
        status: 'Ongoing',
        genres: ['Action', 'Adventure', 'Fantasy']
      })
      
      setChapters([
        { id: 'c1', number: 1, title: 'Chapter 1' },
        { id: 'c2', number: 2, title: 'Chapter 2' },
        { id: 'c3', number: 3, title: 'Chapter 3' }
      ])
      
      setLoading(false)
    }, 1000)
  }, [id])
  
  if (loading) {
    return <p>Loading manga details...</p>
  }
  
  return (
    <div className="manga-detail-page">
      <div className="manga-header">
        <img src={manga.coverImage} alt={manga.title} />
        <div className="manga-info">
          <h1>{manga.title}</h1>
          <p><strong>Author:</strong> {manga.author}</p>
          <p><strong>Status:</strong> {manga.status}</p>
          <div className="genres">
            {manga.genres.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="manga-description">
        <h2>Description</h2>
        <p>{manga.description}</p>
      </div>
      
      <div className="manga-chapters">
        <h2>Chapters</h2>
        <ul>
          {chapters.map(chapter => (
            <li key={chapter.id}>
              <Link to={`/chapter/${chapter.id}`}>
                Chapter {chapter.number}: {chapter.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MangaDetailPage