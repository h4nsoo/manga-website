# 📚 Manga Reader Web Application

A modern, feature-rich manga reading web application built with React 19 and Vite. Browse thousands of manga titles, track your favorites with bookmarks, and enjoy a smooth reading experience powered by the MangaDex API.

![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.3.1-646CFF.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🎯 Core Functionality

- **📖 Chapter Reader** - Clean, distraction-free reading interface with page-by-page navigation
- **🔍 Advanced Search** - Search manga by title with instant results
- **🔖 Bookmark System** - Save and manage your favorite manga with localStorage persistence
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **⚡ Performance Optimized** - Lazy loading, image optimization, and efficient rendering

### 🏠 Pages & Navigation

- **Home Page** - Featured manga carousel with auto-rotating slider
- **Browse** - Explore manga library with search capabilities
- **Popular** - Discover trending manga sorted by follows and recent updates
- **Latest Updates** - View recently updated manga series (last 7 days)
- **Bookmarks** - Quick access to your saved manga collection
- **Manga Details** - Comprehensive information including description, genres, authors, and chapter list
- **Chapter Reader** - Full-screen reading experience with next/previous navigation

### 🎨 UI/UX Features

- Custom scrollbar with SimpleBar
- Auto-hiding header in chapter reader
- Smooth scroll animations
- Back to top button
- Loading states with custom loader component
- Error handling with retry functionality
- Genre buttons for filtering
- Social media links in footer

### 🔧 Technical Features

- Context API for state management (Bookmarks, Scroll)
- Custom hooks for scroll behavior
- Lazy loading for route components
- Retry logic for failed API requests
- Responsive image loading with placeholder support
- English chapter verification
- Multiple fallback strategies for API endpoints

## 🛠️ Tech Stack

### Core

- **React 19.0.0** - Latest version with improved performance
- **React Router DOM** - Client-side routing and navigation
- **Vite 6.3.1** - Lightning-fast build tool and dev server

### Styling

- **Custom CSS** - Component-specific styling with CSS variables
- **Styled Components** - CSS-in-JS styling solution (available but minimal usage)

### Additional Libraries

- **SimpleBar React** - Custom scrollbar component
- **MangaDex API** - Manga data source

### Development Tools

- **ESLint** - Code linting and quality
- **Vite Plugin React** - Fast refresh and HMR

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm or yarn package manager
- Internet connection (for MangaDex API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/manga-app.git
   cd manga-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_BASE_URL=https://api.mangadex.org
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📜 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint to check code quality         |

## 📂 Project Structure

```
manga-app/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   │   ├── BackToTopButton.jsx
│   │   ├── BookmarkButton.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── Footer.jsx
│   │   ├── GenreButton.jsx
│   │   ├── Loader.jsx
│   │   ├── MangaCard.jsx
│   │   ├── MangaGrid.jsx
│   │   ├── NavBar.jsx
│   │   ├── SearchBox.jsx
│   │   ├── Slider.jsx
│   │   └── Socials.jsx
│   ├── contexts/          # React Context providers
│   │   ├── BookmarkContext.jsx
│   │   └── ScrollContext.jsx
│   ├── hooks/             # Custom React hooks
│   │   └── useScrollToTop.js
│   ├── pages/             # Route page components
│   │   ├── BookmarksPage.jsx
│   │   ├── BrowsePage.jsx
│   │   ├── ChapterReaderPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LatestUpdatesPage.jsx
│   │   ├── MangaDetailPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── PopularPage.jsx
│   ├── styles/            # CSS stylesheets
│   ├── utils/             # Utility functions
│   │   └── performance.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🎮 Usage Guide

### Browsing Manga

1. Visit the **Home** page to see featured manga in the carousel
2. Navigate to **Browse** to explore the full library
3. Use the **Search** box to find specific manga titles
4. Check **Popular** for trending series
5. View **Latest Updates** for recently updated manga

### Reading Manga

1. Click on any manga card to view details
2. Select a chapter from the chapter list
3. Use arrow keys or on-screen buttons to navigate pages
4. The header auto-hides while scrolling for immersive reading

### Managing Bookmarks

1. Click the bookmark icon on any manga card
2. Visit the **Bookmarks** page to see all saved manga
3. Click "Clear All" to remove all bookmarks at once
4. Bookmarks persist across browser sessions

## 🔑 Key Features Explained

### Bookmark System

- Persists in browser localStorage
- Stores manga ID, title, cover image, and timestamp
- Duplicate prevention
- Quick access from navigation bar

### Performance Optimizations

- Lazy loading of route components
- Optimized image sizes (`.256.jpg` thumbnails)
- API request retry logic with exponential backoff
- Efficient state management with Context API
- Custom scroll behavior hooks

### API Integration

- Primary: MangaDex API (`https://api.mangadex.org`)
- Includes English chapter verification
- Multiple fallback strategies for reliability
- Safe content rating filters
- Comprehensive error handling

## 🌐 API Reference

This application uses the [MangaDex API](https://api.mangadex.org/docs/):

- `GET /manga` - Fetch manga list
- `GET /manga/{id}` - Get manga details
- `GET /manga/{id}/feed` - Get manga chapters
- `GET /chapter/{id}` - Get chapter details
- `GET /at-home/server/{id}` - Get chapter pages

## 🎨 Customization

### Modifying Styles

- Component-specific styles are in `src/styles/`
- Global styles in `src/index.css`
- Uses CSS variables defined in `:root` for theming

### Changing API Settings

- Update `VITE_BASE_URL` in `.env`
- Modify content ratings in API calls
- Adjust limits and pagination settings

### Adding Features

- Create new components in `src/components/`
- Add routes in `src/App.jsx`
- Create page components in `src/pages/`

## 🐛 Known Issues & Limitations

- Requires active internet connection
- Dependent on MangaDex API availability
- Some manga may not have English translations
- Large chapter lists may take time to load

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohamed Belgacem**

- GitHub: [@h4nsoo](https://github.com/h4nsoo)

## 🙏 Acknowledgments

- [MangaDex](https://mangadex.org/) for providing the API
- All contributors and users of this application

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check existing issues for solutions
- Review the MangaDex API documentation

---

⭐ **If you find this project useful, please consider giving it a star!** ⭐

---

**Made with ❤️ and React**
