
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function ChapterReaderPage() {
  const { chapterId } = useParams()
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  
  useEffect(() => {
    setTimeout(() => {
      setPages([
        'https://via.placeholder.com/800x1200?text=Page+1',
        'https://via.placeholder.com/800x1200?text=Page+2',
        'https://via.placeholder.com/800x1200?text=Page+3',
      ])
      setLoading(false)
    }, 1000)
  }, [chapterId])
  
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  if (loading) {
    return <p>Loading chapter...</p>
  }
  
  return (
    <div className="chapter-reader-page">
      <div className="reader-controls">
        <button onClick={prevPage} disabled={currentPage === 0}>Previous Page</button>
        <span>Page {currentPage + 1} of {pages.length}</span>
        <button onClick={nextPage} disabled={currentPage === pages.length - 1}>Next Page</button>
      </div>
      
      <div className="page-display">
        <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} />
      </div>
    </div>
  )
}

export default ChapterReaderPage