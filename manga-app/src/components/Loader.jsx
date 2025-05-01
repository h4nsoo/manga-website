import React from 'react';

function Loader({ size = 'medium', text = 'Loading...' }) {
  return (
    <div className={`loader-container ${size}`}>
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loader;