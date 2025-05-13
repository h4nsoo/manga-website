import React from 'react';
import { Link } from 'react-router-dom';

function GenreButton({ genre, onClick }) {
  const { id, name, count } = genre;
  
  if (onClick) {
    return (
      <button 
        className="genre-button" 
        onClick={() => onClick(genre)}
        aria-label={`View ${name} manga`}
      >
        <span className="genre-name">{name}</span>
        {count && <span className="genre-count">{count}</span>}
      </button>
    );
  }
  
  return (
    <Link 
      to={`/genres/${id}`} 
      className="genre-button"
      aria-label={`View ${name} manga`}
    >
      <span className="genre-name">{name}</span>
      {count && <span className="genre-count">{count}</span>}
    </Link>
  );
}

export default GenreButton;