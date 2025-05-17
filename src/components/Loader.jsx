import '../styles/Loader.css';

function Loader({message}) {
  return (
    <div className="loading-container">
          <div className="loading">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>{message}</p>
        </div>
  );
}

export default Loader;