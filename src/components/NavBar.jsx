import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";
import ToonSahLogo from "../assets/logo.png";

function Navbar() {
  return (
    <header>
      <div className="logo">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <img src={ToonSahLogo} alt="Logo" />
        </NavLink>
      </div>
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
      </nav>
    </header>
  );
}

export default Navbar;
