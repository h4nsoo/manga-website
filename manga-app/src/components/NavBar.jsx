import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <div className="logo">MangaReader</div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/genres">Genres</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
