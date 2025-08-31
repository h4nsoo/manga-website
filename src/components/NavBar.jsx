import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/NavBar.css";
import ToonSahLogo from "../assets/logo.png";
import BurgerBarIcon from "../assets/burger-bar.png";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="logo">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMenu}
        >
          <img src={ToonSahLogo} alt="Logo" />
        </NavLink>
      </div>

      <button
        className={`burger-menu ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <img src={BurgerBarIcon} alt="Menu" className="burger-icon" />
      </button>

      <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/browse"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMenu}
        >
          Browse
        </NavLink>
      </nav>

      {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
    </header>
  );
}

export default Navbar;
