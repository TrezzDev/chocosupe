import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

let currentPage = 1;
let currentYear = new Date().getFullYear();
let currentSeason = getCurrentSeason();

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
}

export async function seasonPage({ query }) {
  currentPage = parseInt(query.page) || 1;
  currentYear = parseInt(query.year) || currentYear;
  currentSeason = query.season || currentSeason;
  
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
        <h1 class="section-title" style="margin: 0;">${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} ${currentYear} Anime</h1>
        
        <div style="display: flex; gap: 12px;">
          <select id="season-select" class="filter-select">
            <option value="winter" ${currentSeason === 'winter' ? 'selected' : ''}>Winter</option>
            <option value="spring" ${currentSeason === 'spring' ? 'selected' : ''}>Spring</option>
            <option value="summer" ${currentSeason === 'summer' ? 'selected' : ''}>Summer</option>
            <option value="fall" ${currentSeason === 'fall' ? 'selected' : ''}>Fall</option>
          </select>
          
          <select id="year-select" class="filter-select">
            ${generateYearOptions()}
          </select>
          
          <button class="btn btn-secondary" onclick="loadCurrentSeason()">Current</button>
          <button class="btn btn-secondary" onclick="loadUpcoming()">Upcoming</button>
        </div>
      </div>
      
      <div id="season-content">
        ${Skeleton.cards(12)}
      </div>
      
      <div id="pagination"></div>
    </div>
  `;

  // Event listeners
  document.getElementById('season-select').addEventListener('change', (e) => {
    currentSeason = e.target.value;
    currentPage = 1;
    updateURL();
    loadSeason();
  });
  
  document.getElementById('year-select').addEventListener('change', (e) => {
    currentYear = parseInt(e.target.value);
    currentPage = 1;
    updateURL();
    loadSeason();
  });

  await loadSeason();
}

function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  let options = '';
  for (let year = currentYear + 1; year >= 1940; year--) {
    options += `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
  }
  return options;
}

async function loadSeason() {
  const contentContainer = document.getElementById('season-content');
  const paginationContainer = document.getElementById('pagination');
  
  contentContainer.innerHTML = Skeleton.cards(12);
  paginationContainer.innerHTML = '';
  
  try {
    const results = await jikan.getSeason(currentYear, currentSeason, currentPage);
    renderSeason(results.data, results.pagination);
  } catch (error) {
    console.error('Season error:', error);
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error loading season data. Please try again.</p>
      </div>
    `;
  }
}

async function loadCurrentSeason() {
  currentYear = new Date().getFullYear();
  currentSeason = getCurrentSeason();
  currentPage = 1;
  updateURL();
  await loadSeason();
  // Update selects
  document.getElementById('season-select').value = currentSeason;
  document.getElementById('year-select').value = currentYear;
}

async function loadUpcoming() {
  const contentContainer = document.getElementById('season-content');
  const paginationContainer = document.getElementById('pagination');
  
  contentContainer.innerHTML = Skeleton.cards(12);
  
  try {
    const results = await jikan.getSeasonUpcoming();
    renderSeason(results.data, { last_visible_page: 1, has_next_page: false });
  } catch (error) {
    console.error('Upcoming error:', error);
    contentContainer.innerHTML = `<p>Error loading upcoming anime.</p>`;
  }
}

function renderSeason(data, pagination) {
  const contentContainer = document.getElementById('season-content');
  const paginationContainer = document.getElementById('pagination');
  
  if (data.length === 0) {
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>No anime found for this season.</p>
      </div>
    `;
    return;
  }

  contentContainer.innerHTML = `
    <div class="grid-section grid-6">
      ${data.map(anime => createAnimeCard(anime)).join('')}
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
          loadSeason();
          window.scrollTo(0, 0);
        },
        pagination.last_visible_page
      )
    );
  }
}

function createAnimeCard(anime) {
  const score = anime.score ? anime.score.toFixed(2) : 'N/A';
  const scoreClass = anime.score >= 8 ? 'score-great' : 
                     anime.score >= 7 ? 'score-good' : 
                     anime.score >= 6 ? 'score-average' : 'score-bad';
  
  return `
    <div class="anime-card" onclick="router.navigate('/anime/${anime.mal_id}')">
      <div class="card-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
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

function updateURL() {
  const params = new URLSearchParams();
  if (currentPage > 1) params.set('page', currentPage);
  params.set('year', currentYear);
  params.set('season', currentSeason);
  router.navigate(`/season?${params.toString()}`, true);
}

// Expose functions globally for onclick handlers
window.loadCurrentSeason = loadCurrentSeason;
window.loadUpcoming = loadUpcoming;