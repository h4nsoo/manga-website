import { Link } from "react-router-dom";
import "../styles/Footer.css";
import Socials from "./Socials";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Browse</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/browse">Browse Manga</Link>
            </li>
            <li>
              <Link to="/popular">Popular Series</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <div className="footer-social-container">
            <Socials />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} ToonSah - Powered by MangaDex API
        </p>
      </div>
    </footer>
  );
};

export default Footer;
