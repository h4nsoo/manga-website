import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ScrollProvider } from "./contexts/ScrollContext";
import "./index.css";
import App from "./App.jsx";

// Load fonts asynchronously to avoid render-blocking
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
link.rel = "stylesheet";
link.media = "print";
link.onload = function () {
  this.media = "all";
};
document.head.appendChild(link);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollProvider>
        <App />
      </ScrollProvider>
    </BrowserRouter>
  </StrictMode>
);
