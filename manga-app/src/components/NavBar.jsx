import { NavLink } from "react-router-dom";
import '../styles/Navbar.css';

function Navbar() {
  return (
    <header>
      <div className="logo">MangaReader</div>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/browse"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Browse
        </NavLink>
        <NavLink
          to="/genres"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Genres
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
