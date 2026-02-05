import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

let currentPage = 1;
let currentGenreId = null;
let currentGenreName = '';
let currentType = 'anime';
let genresList = [];

export async function genrePage({ params, query }) {
  currentGenreId = params.id;
  currentType = query.type || 'anime';
  currentPage = parseInt(query.page) || 1;
  
  const main = document.getElementById('app');
  
  // Load genres list first if not cached
  if (genresList.length === 0) {
    try {
      const [animeGenres, mangaGenres] = await Promise.all([
        jikan.getAnimeGenres(),
        jikan.getMangaGenres()
      ]);
      genresList = {
        anime: animeGenres.data,
        manga: mangaGenres.data
      };
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  }
  
  // Find genre name
  const genreList = genresList[currentType] || [];
  const genre = genreList.find(g => g.mal_id === parseInt(currentGenreId));
  currentGenreName = genre?.name || 'Genre';
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <h1 class="section-title">${currentGenreName}</h1>
      
      <div style="display: flex; gap: 16px; margin-bottom: 24px;">
        <button class="btn ${currentType === 'anime' ? 'btn-primary' : 'btn-secondary'}" onclick="switchGenreType('anime')">
          Anime
        </button>
        <button class="btn ${currentType === 'manga' ? 'btn-primary' : 'btn-secondary'}" onclick="switchGenreType('manga')">
          Manga
        </button>
      </div>
      
      <div class="genre-cloud" style="margin-bottom: 32px;">
        ${genreList.map(g => `
          <button 
            class="genre-tag ${g.mal_id === parseInt(currentGenreId) ? 'active' : ''}" 
            onclick="router.navigate('/genre/${g.mal_id}?type=${currentType}')"
          >
            ${g.name}
          </button>
        `).join('')}
      </div>
      
      <div id="genre-content">
        ${Skeleton.cards(12)}
      </div>
      
      <div id="pagination"></div>
    </div>
  `;

  await loadGenreContent();
}

async function loadGenreContent() {
  const contentContainer = document.getElementById('genre-content');
  const paginationContainer = document.getElementById('pagination');
  
  contentContainer.innerHTML = Skeleton.cards(12);
  paginationContainer.innerHTML = '';
  
  try {
    let results;
    
    if (currentType === 'anime') {
      results = await jikan.searchAnime('', {
        genres: [currentGenreId],
        page: currentPage,
        limit: 24,
        order_by: 'members',
        sort: 'desc'
      });
    } else {
      results = await jikan.searchManga('', {
        genres: [currentGenreId],
        page: currentPage,
        limit: 24,
        order_by: 'members',
        sort: 'desc'
      });
    }

    renderGenreContent(results.data, results.pagination);
    
  } catch (error) {
    console.error('Genre error:', error);
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error loading genre content. Please try again.</p>
      </div>
    `;
  }
}

function renderGenreContent(data, pagination) {
  const contentContainer = document.getElementById('genre-content');
  const paginationContainer = document.getElementById('pagination');
  
  if (data.length === 0) {
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>No ${currentType} found in this genre.</p>
      </div>
    `;
    return;
  }

  contentContainer.innerHTML = `
    <div class="grid-section grid-6">
      ${data.map(item => currentType === 'anime' ? createAnimeCard(item) : createMangaCard(item)).join('')}
    </div>
  `;
  
  if (pagination.last_visible_page > 1) {
    paginationContainer.appendChild(
      createPagination(
        currentPage,
        pagination.has_next_page,
        (page) => {
          currentPage = page;
          updateURL();
          loadGenreContent();
          window.scrollTo(0, 0);
        },
        pagination.last_visible_page
      )
    );
  }
}

function createAnimeCard(anime) {
  const score = anime.score ? anime.score.toFixed(2) : 'N/A';
  
  return `
    <div class="anime-card" onclick="router.navigate('/anime/${anime.mal_id}')">
      <div class="card-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
        ${anime.score ? `<span class="card-score">${score}</span>` : ''}
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

function createMangaCard(manga) {
  const score = manga.score ? manga.score.toFixed(2) : 'N/A';
  
  return `
    <div class="manga-card" onclick="router.navigate('/manga/${manga.mal_id}')">
      <div class="card-image">
        <img src="${manga.images.jpg.image_url}" alt="${manga.title}" loading="lazy">
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

function updateURL() {
  const params = new URLSearchParams();
  params.set('type', currentType);
  if (currentPage > 1) params.set('page', currentPage);
  router.navigate(`/genre/${currentGenreId}?${params.toString()}`, true);
}

// Expose function globally
window.switchGenreType = (type) => {
  currentType = type;
  currentPage = 1;
  updateURL();
  // Re-render page with new type
  router.navigate(`/genre/${currentGenreId}?type=${type}`);
};