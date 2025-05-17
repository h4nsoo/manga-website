import { Link } from "react-router-dom";
import "../styles/Footer.css";
import Socials from "./Socials";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Project Info</h4>
          <ul className="footer-links">
            <li>
              <Link to="/about">About This Project</Link>
            </li>
            <li>
              <a href="https://github.com/yourusername/manga-app" target="_blank" rel="noopener noreferrer">Source Code</a>
            </li>
            <li>
              <a href="https://api.mangadex.org/docs/" target="_blank" rel="noopener noreferrer">API Documentation</a>
            </li>
            <li>
              <Link to="/technologies">Technologies Used</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Browse</h4>
          <ul className="footer-links">
            <li>
              <Link to="/latest">Latest Updates</Link>
            </li>
            <li>
              <Link to="/popular">Popular Series</Link>
            </li>
            <li>
              <Link to="/genres">Genres</Link>
            </li>
            <li>
              <Link to="/random">Random Manga</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect With Me</h4>
          <div className="footer-social-container">
            <Socials />
          </div>
          <p className="portfolio-link">
            <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer">
              Visit My Portfolio →
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ToonSah - Built with the MangaDex API</p>
      </div>
    </footer>
  );
};

export default Footer;