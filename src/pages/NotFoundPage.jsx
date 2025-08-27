import { Link } from "react-router-dom";
import { useScroll } from "../contexts/ScrollContext";

function NotFoundPage() {
  const { scrollToTop } = useScroll();

  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" onClick={() => scrollToTop("auto")}>
        Go back to homepage
      </Link>
    </div>
  );
}

export default NotFoundPage;
