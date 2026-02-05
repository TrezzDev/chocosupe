# chocosupe
anime-website/
├── index.html                 # Entry point & Home
├── css/
│   ├── base.css              # Variables, reset, utilities
│   ├── components.css        # Cards, buttons, loaders
│   ├── layout.css            # Grid, navigation, footer
│   ├── pages.css             # Page-specific styles
│   └── dark-theme.css        # Dark mode (default)
├── js/
│   ├── api/
│   │   └── jikan.js          # API wrapper dengan rate limiting
│   ├── components/
│   │   ├── router.js         # SPA routing
│   │   ├── loader.js         # Skeleton loading
│   │   └── pagination.js     # Pagination component
│   ├── pages/
│   │   ├── home.js           # Home page logic
│   │   ├── anime-detail.js   # Anime detail page
│   │   ├── manga-detail.js   # Manga detail page
│   │   ├── character.js      # Character detail
│   │   ├── people.js         # People/VA detail
│   │   ├── search.js         # Search & filter
│   │   ├── top.js            # Top rankings
│   │   ├── season.js         # Season & schedule
│   │   ├── watch.js          # Watch episodes/promos
│   │   ├── genre.js          # Genre listing
│   │   └── random.js         # Random anime/manga
│   └── app.js                # Main application
└── assets/
    └── images/                 # Placeholder/fallback images
