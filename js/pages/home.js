import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { router } from '../components/router.js';

export async function homePage() {
  const main = document.getElementById('app');
  
  // Show skeleton loading
  main.innerHTML = `
    <div class="container">
      <!-- Hero Skeleton -->
      <div class="hero" style="height: 500px; display: flex; align-items: center;">
        <div class="container">
          <div style="display: grid; grid-template-columns: 300px 1fr; gap: 40px; align-items: center;">
            <div class="skeleton" style="aspect-ratio: 3/4; border-radius: 20px;"></div>
            <div>
              <div class="skeleton" style="height: 50px; width: 70%; margin-bottom: 20px;"></div>
              <div class="skeleton" style="height: 20px; width: 50%; margin-bottom: 20px;"></div>
              <div class="skeleton" style="height: 100px; margin-bottom: 20px;"></div>
              <div class="skeleton" style="height: 48px; width: 150px; border-radius: 12px;"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sections Skeleton -->
      ${Array(4).fill(`
        <div class="section">
          <div class="container">
            <div class="skeleton" style="height: 30px; width: 200px; margin-bottom: 24px;"></div>
            <div class="grid-section grid-6">
              ${Skeleton.cards(6)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    // Fetch all data in parallel dengan rate limiting yang sudah dihandle
    const [
      topAnime,
      topManga,
      topCharacters,
      seasonNow,
      upcoming,
      recentEpisodes,
      popularPromos
    ] = await Promise.all([
      jikan.getTopAnime('airing', 1, 5),
      jikan.getTopManga('manga', 1, 5),
      jikan.getTopCharacters(1, 6),
      jikan.getSeasonNow(),
      jikan.getSeasonUpcoming(),
      jikan.getWatchEpisodes(1),
      jikan.getWatchPopularPromos(1)
    ]);

    // Random anime dari top list
    const randomAnime = topAnime.data[Math.floor(Math.random() * topAnime.data.length)];
    const heroAnime = await jikan.getAnime(randomAnime.mal_id);

    renderHome({
      hero: heroAnime.data,
      topAnime: topAnime.data,
      topManga: topManga.data,
      topCharacters: topCharacters.data,
      seasonNow: seasonNow.data.slice(0, 6),
      upcoming: upcoming.data.slice(0, 6),
      recentEpisodes: recentEpisodes.data.slice(0, 4),
      popularPromos: popularPromos.data.slice(0, 4)
    });

  } catch (error) {
    console.error('Home page error:', error);
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 20px;">
        <h2>Error Loading Content</h2>
        <p style="color: var(--text-muted); margin-top: 16px;">${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 24px;">
          Try Again
        </button>
      </div>
    `;
  }
}

function renderHome(data) {
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-bg" style="background-image: url('${data.hero.images.jpg.large_image_url}')"></div>
      <div class="container hero-content">
        <div class="hero-poster">
          <img src="${data.hero.images.jpg.large_image_url}" alt="${data.hero.title}" loading="lazy">
        </div>
        <div class="hero-info">
          <h1>${data.hero.title}</h1>
          <div class="hero-meta">
            <span>${data.hero.type || 'TV'}</span>
            <span>${data.hero.episodes || '?'} Episodes</span>
            <span>${data.hero.score ? '★ ' + data.hero.score : 'No score'}</span>
            <span>${data.hero.year || 'Unknown'}</span>
          </div>
          <p class="hero-synopsis">${data.hero.synopsis || 'No synopsis available.'}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="router.navigate('/anime/${data.hero.mal_id}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Watch Now
            </button>
            <button class="btn btn-secondary" onclick="router.navigate('/anime/${data.hero.mal_id}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Season Now -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Season Now
        </h2>
        <div class="grid-section grid-6">
          ${data.seasonNow.map(anime => createAnimeCard(anime)).join('')}
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-secondary" onclick="router.navigate('/season')">View All Season</button>
        </div>
      </section>

      <!-- Top Anime -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Top Anime
        </h2>
        <div class="horizontal-scroll">
          ${data.topAnime.map(anime => createAnimeCard(anime, 'small')).join('')}
        </div>
      </section>

      <!-- Upcoming -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
          Upcoming Anime
        </h2>
        <div class="grid-section grid-6">
          ${data.upcoming.map(anime => createAnimeCard(anime)).join('')}
        </div>
      </section>

      <!-- Recent Episodes -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Recent Episodes
        </h2>
        <div class="grid-section grid-2">
          ${data.recentEpisodes.map(ep => createEpisodeCard(ep)).join('')}
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-secondary" onclick="router.navigate('/watch')">View All Episodes</button>
        </div>
      </section>

      <!-- Top Manga -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0  I need to continue creating the anime website. Let me complete the home.js file and create the remaining essential files.

## Continuing JavaScript Implementation

### `js/pages/home.js` (continued)
```javascript
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Top Manga
        </h2>
        <div class="horizontal-scroll">
          ${data.topManga.map(manga => createMangaCard(manga, 'small')).join('')}
        </div>
      </section>

      <!-- Top Characters -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Top Characters
        </h2>
        <div class="grid-section grid-6">
          ${data.topCharacters.map(char => createCharacterCard(char)).join('')}
        </div>
      </section>

      <!-- Popular Promos -->
      <section class="section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="m10 8l6 4-6 4V8z"></path>
          </svg>
          Popular Promos
        </h2>
        <div class="grid-section grid-4">
          ${data.popularPromos.map(promo => createPromoCard(promo)).join('')}
        </div>
      </section>

      <!-- Random Button -->
      <section class="section" style="text-align: center; padding: 60px 20px;">
        <h2 style="margin-bottom: 24px;">Can't Decide?</h2>
        <button class="btn btn-primary random-btn-large" onclick="window.randomAnime()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l5 5M4 4l5 5"></path>
          </svg>
          Random Anime
        </button>
      </section>
    </div>
  `;
}

// Card creators
function createAnimeCard(anime, size = 'normal') {
  const score = anime.score ? anime.score.toFixed(2) : 'N/A';
  const scoreClass = anime.score >= 8 ? 'score-great' : 
                     anime.score >= 7 ? 'score-good' : 
                     anime.score >= 6 ? 'score-average' : 'score-bad';
  
  return `
    <div class="anime-card" onclick="router.navigate('/anime/${anime.mal_id}')" data-id="${anime.mal_id}">
      <div class="card-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
        ${anime.rank ? `<span class="card-rank">#${anime.rank}</span>` : ''}
        ${anime.score ? `<span class="card-score ${scoreClass}">${score}</span>` : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${anime.title}</h3>
        <div class="card-meta">
          <span>${anime.type || 'TV'}</span>
          <span>${anime.episodes || '?'} eps</span>
        </div>
      </div>
    </div>
  `;
}

function createMangaCard(manga, size = 'normal') {
  const score = manga.score ? manga.score.toFixed(2) : 'N/A';
  return `
    <div class="manga-card" onclick="router.navigate('/manga/${manga.mal_id}')" data-id="${manga.mal_id}">
      <div class="card-image">
        <img src="${manga.images.jpg.image_url}" alt="${manga.title}" loading="lazy">
        ${manga.rank ? `<span class="card-rank">#${manga.rank}</span>` : ''}
        ${manga.score ? `<span class="card-score">${score}</span>` : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${manga.title}</h3>
        <div class="card-meta">
          <span>${manga.type || 'Manga'}</span>
          <span>${manga.chapters || '?'} ch</span>
        </div>
      </div>
    </div>
  `;
}

function createCharacterCard(character) {
  return `
    <div class="character-card" onclick="router.navigate('/character/${character.mal_id}')" data-id="${character.mal_id}">
      <div class="card-image">
        <img src="${character.images.jpg.image_url}" alt="${character.name}" loading="lazy">
        ${character.rank ? `<span class="card-rank">#${character.rank}</span>` : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${character.name}</h3>
        <div class="card-meta">
          <span>${character.favorites?.toLocaleString() || 0} favorites</span>
        </div>
      </div>
    </div>
  `;
}

function createEpisodeCard(episode) {
  return `
    <div class="episode-card" onclick="router.navigate('/anime/${episode.entry.mal_id}')">
      <div class="episode-thumbnail">
        <img src="${episode.entry.images.jpg.image_url}" alt="${episode.entry.title}">
        <div class="episode-play">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="episode-info">
        <h4>${episode.entry.title}</h4>
        <p>Episode ${episode.episodes[0]?.title || 'N/A'}</p>
        <div class="episode-meta">
          <span>${new Date(episode.episodes[0]?.aired || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  `;
}

function createPromoCard(promo) {
  return `
    <div class="recommendation-card" onclick="window.open('${promo.trailer.url}', '_blank')">
      <img src="${promo.entry.images.jpg.large_image_url}" alt="${promo.entry.title}">
      <div class="video-overlay">
        <div class="video-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="recommendation-overlay">
        <h4>${promo.entry.title}</h4>
        <p>${promo.title}</p>
      </div>
    </div>
  `;
}

// Expose random function to window
window.randomAnime = async () => {
  const btn = document.querySelector('.random-btn-large');
  btn.disabled = true;
  btn.innerHTML = 'Loading...';
  
  try {
    const { data } = await jikan.getRandomAnime();
    router.navigate(`/anime/${data.mal_id}`);
  } catch (error) {
    alert('Failed to get random anime. Please try again.');
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l5 5M4 4l5 5"></path>
      </svg>
      Random Anime
    `;
  }
};