import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

let currentSearchType = 'anime';
let currentPage = 1;
let currentQuery = '';
let currentFilters = {};

export async function searchPage({ query }) {
  const main = document.getElementById('app');
  currentQuery = query.q || '';
  currentPage = parseInt(query.page) || 1;
  currentSearchType = query.type || 'anime';
  
  // Update filters dari query params
  currentFilters = {
    type: query.filter_type,
    status: query.status,
    rating: query.rating,
    genres: query.genres ? query.genres.split(',').map(Number) : [],
    order_by: query.order_by,
    sort: query.sort,
    min_score: query.min_score,
    max_score: query.max_score
  };

  renderSearchInterface();
  
  if (currentQuery) {
    await performSearch();
  }
}

function renderSearchInterface() {
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <div class="search-header">
        <h1>Search</h1>
        <p>Find your next favorite anime or manga</p>
      </div>

      <div class="search-box" style="margin-bottom: 32px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          id="search-input" 
          placeholder="Search anime, manga, characters..." 
          value="${currentQuery}"
          autocomplete="off"
        >
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 2px solid var(--border-color);">
        <button class="search-type-btn ${currentSearchType === 'anime' ? 'active' : ''}" data-type="anime">
          Anime
        </button>
        <button class="search-type-btn ${currentSearchType === 'manga' ? 'active' : ''}" data-type="manga">
          Manga
        </button>
        <button class="search-type-btn ${currentSearchType === 'character' ? 'active' : ''}" data-type="character">
          Characters
        </button>
        <button class="search-type-btn ${currentSearchType === 'people' ? 'active' : ''}" data-type="people">
          People
        </button>
      </div>

      ${currentSearchType === 'anime' || currentSearchType === 'manga' ? `
        <div class="filter-group" id="filters">
          <select class="filter-select" id="filter-type">
            <option value="">All Types</option>
            ${currentSearchType === 'anime' ? `
              <option value="tv" ${currentFilters.type === 'tv' ? 'selected' : ''}>TV</option>
              <option value="movie" ${currentFilters.type === 'movie' ? 'selected' : ''}>Movie</option>
              <option value="ova" ${currentFilters.type === 'ova' ? 'selected' : ''}>OVA</option>
              <option value="special" ${currentFilters.type === 'special' ? 'selected' : ''}>Special</option>
              <option value="ona" ${currentFilters.type === 'ona' ? 'selected' : ''}>ONA</option>
              <option value="music" ${currentFilters.type === 'music' ? 'selected' : ''}>Music</option>
            ` : `
              <option value="manga" ${currentFilters.type === 'manga' ? 'selected' : ''}>Manga</option>
              <option value="novel" ${currentFilters.type === 'novel' ? 'selected' : ''}>Novel</option>
              <option value="lightnovel" ${currentFilters.type === 'lightnovel' ? 'selected' : ''}>Light Novel</option>
              <option value="oneshot" ${currentFilters.type === 'oneshot' ? 'selected' : ''}>Oneshot</option>
              <option value="doujin" ${currentFilters.type === 'doujin' ? 'selected' : ''}>Doujin</option>
              <option value="manhwa" ${currentFilters.type === 'manhwa' ? 'selected' : ''}>Manhwa</option>
              <option value="manhua" ${currentFilters.type === 'manhua' ? 'selected' : ''}>Manhua</option>
            `}
          </select>

          <select class="filter-select" id="filter-status">
            <option value="">All Status</option>
            <option value="airing" ${currentFilters.status === 'airing' ? 'selected' : ''}>Airing</option>
            <option value="complete" ${currentFilters.status === 'complete' ? 'selected' : ''}>Completed</option>
            <option value="upcoming" ${currentFilters.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
          </select>

          ${currentSearchType === 'anime' ? `
            <select class="filter-select" id="filter-rating">
              <option value="">All Ratings</option>
              <option value="g" ${currentFilters.rating === 'g' ? 'selected' : ''}>G - All Ages</option>
              <option value="pg" ${currentFilters.rating === 'pg' ? 'selected' : ''}>PG - Children</option>
              <option value="pg13" ${currentFilters.rating === 'pg13' ? 'selected' : ''}>PG-13 - Teens 13+</option>
              <option value="r17" ${currentFilters.rating === 'r17' ? 'selected' : ''}>R - 17+</option>
              <option value="r" ${currentFilters.rating === 'r' ? 'selected' : ''}>R+ - Mild Nudity</option>
              <option value="rx" ${currentFilters.rating === 'rx' ? 'selected' : ''}>Rx - Hentai</option>
            </select>
          ` : ''}

          <select class="filter-select" id="filter-order">
            <option value="">Sort By</option>
            <option value="mal_id" ${currentFilters.order_by === 'mal_id' ? 'selected' : ''}>ID</option>
            <option value="title" ${currentFilters.order_by === 'title' ? 'selected' : ''}>Title</option>
            <option value="start_date" ${currentFilters.order_by === 'start_date' ? 'selected' : ''}>Start Date</option>
            <option value="end_date" ${currentFilters.order_by === 'end_date' ? 'selected' : ''}>End Date</option>
            <option value="episodes" ${currentFilters.order_by === 'episodes' ? 'selected' : ''}>Episodes</option>
            <option value="score" ${currentFilters.order_by === 'score' ? 'selected' : ''}>Score</option>
            <option value="scored_by" ${currentFilters.order_by === 'scored_by' ? 'selected' : ''}>Scored By</option>
            <option value="rank" ${currentFilters.order_by === 'rank' ? 'selected' : ''}>Rank</option>
            <option value="popularity" ${currentFilters.order_by === 'popularity' ? 'selected' : ''}>Popularity</option>
            <option value="members" ${currentFilters.order_by === 'members' ? 'selected' : ''}>Members</option>
            <option value="favorites" ${currentFilters.order_by === 'favorites' ? 'selected' : ''}>Favorites</option>
          </select>

          <select class="filter-select" id="filter-sort">
            <option value="desc" ${currentFilters.sort === 'desc' ? 'selected' : ''}>Descending</option>
            <option value="asc" ${currentFilters.sort === 'asc' ? 'selected' : ''}>Ascending</option>
          </select>
        </div>
      ` : ''}

      <div id="search-results">
        ${currentQuery ? Skeleton.cards(12) : `
          <div style="text-align: center; padding: 80px 20px; color: var(--text-muted);">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.5;">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p>Enter a search term to find ${currentSearchType}</p>
          </div>
        `}
      </div>

      <div id="pagination"></div>
    </div>
  `;

  // Event listeners
  const searchInput = document.getElementById('search-input');
  let debounceTimer;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentQuery = e.target.value;
      currentPage = 1;
      if (currentQuery.length >= 3) {
        updateURL();
        performSearch();
      }
    }, 500);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      currentQuery = e.target.value;
      currentPage = 1;
      updateURL();
      performSearch();
    }
  });

  // Type switcher
  document.querySelectorAll('.search-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.search-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSearchType = btn.dataset.type;
      currentPage = 1;
      renderSearchInterface();
      if (currentQuery) performSearch();
    });
  });

  // Filter listeners
  document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', () => {
      currentPage = 1;
      updateFilters();
      updateURL();
      performSearch();
    });
  });
}

function updateFilters() {
  currentFilters = {
    type: document.getElementById('filter-type')?.value || undefined,
    status: document.getElementById('filter-status')?.value || undefined,
    rating: document.getElementById('filter-rating')?.value || undefined,
    order_by: document.getElementById('filter-order')?.value || undefined,
    sort: document.getElementById('filter-sort')?.value || 'desc'
  };
}

function updateURL() {
  const params = new URLSearchParams();
  if (currentQuery) params.set('q', currentQuery);
  if (currentPage > 1) params.set('page', currentPage);
  params.set('type', currentSearchType);
  
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  router.navigate(`/search?${params.toString()}`, true);
}

async function performSearch() {
  const resultsContainer = document.getElementById('search-results');
  const paginationContainer = document.getElementById('pagination');
  
  resultsContainer.innerHTML = Skeleton.cards(12);
  paginationContainer.innerHTML = '';

  try {
    let results;
    
    switch (currentSearchType) {
      case 'anime':
        results = await jikan.searchAnime(currentQuery, {
          ...currentFilters,
          page: currentPage,
          limit: 24
        });
        break;
      case 'manga':
        results = await jikan.searchManga(currentQuery, {
          ...currentFilters,
          page: currentPage,
          limit: 24
        });
        break;
      case 'character':
        results = await jikan.searchCharacters(currentQuery, currentPage, 24);
        break;
      case 'people':
        results = await jikan.searchPeople(currentQuery, currentPage, 24);
        break;
    }

    renderResults(results.data, results.pagination);
    
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error performing search. Please try again.</p>
      </div>
    `;
  }
}

function renderResults(data, pagination) {
  const resultsContainer = document.getElementById('search-results');
  const paginationContainer = document.getElementById('pagination');
  
  if (data.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>No results found for "${currentQuery}"</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `<div class="grid-section grid-6">${data.map(item => createCard(item)).join('')}</div>`;
  
  if (pagination.last_visible_page > 1) {
    paginationContainer.appendChild(
      createPagination(
        currentPage,
        pagination.has_next_page,
        (page) => {
          currentPage = page;
          updateURL();
          performSearch();
          window.scrollTo(0, 0);
        },
        pagination.last_visible_page
      )
    );
  }
}

function createCard(item) {
  const score = item.score ? item.score.toFixed(2) : 'N/A';
  
  if (currentSearchType === 'character') {
    return `
      <div class="character-card" onclick="router.navigate('/character/${item.mal_id}')">
        <div class="card-image">
          <img src="${item.images.jpg.image_url}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.name}</h3>
          <div class="card-meta">
            <span>${item.favorites?.toLocaleString() || 0} favorites</span>
          </div>
        </div>
      </div>
    `;
  }
  
  if (currentSearchType === 'people') {
    return `
      <div class="character-card" onclick="router.navigate('/people/${item.mal_id}')">
        <div class="card-image">
          <img src="${item.images.jpg.image_url}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.name}</h3>
          <div class="card-meta">
            <span>${item.favorites?.toLocaleString() || 0} favorites</span>
          </div>
        </div>
      </div>
    `;
  }

  const isAnime = currentSearchType === 'anime';
  const route = isAnime ? 'anime' : 'manga';
  const count = isAnime ? `${item.episodes || '?'} eps` : `${item.chapters || '?'} ch`;
  
  return `
    <div class="anime-card" onclick="router.navigate('/${route}/${item.mal_id}')">
      <div class="card-image">
        <img src="${item.images.jpg.image_url}" alt="${item.title}" loading="lazy">
        ${item.score ? `<span class="card-score">${score}</span>` : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta">
          <span>${item.type || (isAnime ? 'TV' : 'Manga')}</span>
          <span>${count}</span>
        </div>
      </div>
    </div>
  `;
}