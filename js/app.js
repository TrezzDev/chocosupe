import { router } from './components/router.js';
import { homePage } from './pages/home.js';
import { animeDetailPage } from './pages/anime-detail.js';
import { searchPage } from './pages/search.js';

// Import other pages (create these as needed)
// import { mangaDetailPage } from './pages/manga-detail.js';
// import { characterPage } from './pages/character.js';
// import { peoplePage } from './pages/people.js';
// import { topPage } from './pages/top.js';
// import { seasonPage } from './pages/season.js';
// import { schedulePage } from './pages/schedule.js';
// import { watchPage } from './pages/watch.js';
// import { genrePage } from './pages/genre.js';
// import { randomPage } from './pages/random.js';

// Initialize router
function initRouter() {
  router
    .on('/', homePage)
    .on('/anime/:id', animeDetailPage)
    .on('/search', searchPage)
    // Add more routes as you create the pages
    // .on('/manga/:id', mangaDetailPage)
    // .on('/character/:id', characterPage)
    // .on('/people/:id', peoplePage)
    // .on('/top/:type', topPage)
    // .on('/season', seasonPage)
    // .on('/schedule', schedulePage)
    // .on('/watch', watchPage)
    // .on('/genre/:id', genrePage)
    // .on('/random', randomPage)
    .on('/404', () => {
      document.getElementById('app').innerHTML = `
        <div class="container" style="text-align: center; padding: 100px 20px;">
          <h1>404</h1>
          <p>Page not found</p>
          <a href="/" class="btn btn-primary" style="margin-top: 24px;" data-router>Go Home</a>
        </div>
      `;
    });
}

// Mobile menu toggle
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  
  menuBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initMobileMenu();
  
  // Expose router globally for onclick handlers
  window.router = router;
});
