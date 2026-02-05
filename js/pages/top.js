import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

let currentPage = 1;
let currentType = 'anime';
let currentFilter = 'airing';

export async function topPage({ params, query }) {
  currentType = params.type || 'anime';
  currentPage = parseInt(query.page) || 1;
  currentFilter = query.filter || getDefaultFilter(currentType);
  
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <h1 class="section-title">Top ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}</h1>
      
      <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
        ${getFilterButtons()}
      </div>
      
      <div id="ranking-content">
        ${Skeleton.ranking(10)}
      </div>
      
      <div id="pagination"></div>
    </div>
  `;

  await loadRanking();
}

function getDefaultFilter(type) {
  switch(type) {
    case 'anime': return 'airing';
    case 'manga': return 'manga';
    case 'characters': return '';
    case 'people': return '';
    case 'reviews': return '';
    default: return '';
  }
}

function getFilterButtons() {
  if (currentType === 'anime') {
    return `
      <button class="filter-btn ${currentFilter === 'airing' ? 'active' : ''}" data-filter="airing">Airing</button>
      <button class="filter-btn ${currentFilter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">Upcoming</button>
      <button class="filter-btn ${currentFilter === 'tv' ? 'active' : ''}" data-filter="tv">TV</button>
      <button class="filter-btn ${currentFilter === 'movie' ? 'active' : ''}" data-filter="movie">Movie</button>
      <button class="filter-btn ${currentFilter === 'ova' ? 'active' : ''}" data-filter="ova">OVA</button>
      <button class="filter-btn ${currentFilter === 'special' ? 'active' : ''}" data-filter="special">Special</button>
      <button class="filter-btn ${currentFilter === 'bypopularity' ? 'active' : ''}" data-filter="bypopularity">By Popularity</button>
      <button class="filter-btn ${currentFilter === 'favorite' ? 'active' : ''}" data-filter="favorite">Most Favorited</button>
    `;
  } else if (currentType === 'manga') {
    return `
      <button class="filter-btn ${currentFilter === 'manga' ? 'active' : ''}" data-filter="manga">Manga</button>
      <button class="filter-btn ${currentFilter === 'novels' ? 'active' : ''}" data-filter="novels">Novels</button>
      <button class="filter-btn ${currentFilter === 'manhwa' ? 'active' : ''}" data-filter="manhwa">Manhwa</button>
      <button class="filter-btn ${currentFilter === 'manhua' ? 'active' : ''}" data-filter="manhua">Manhua</button>
      <button class="filter-btn ${currentFilter === 'bypopularity' ? 'active' : ''}" data-filter="bypopularity">By Popularity</button>
      <button class="filter-btn ${currentFilter === 'favorite' ? 'active' : ''}" data-filter="favorite">Most Favorited</button>
    `;
  }
  return '';
}

async function loadRanking() {
  const contentContainer = document.getElementById('ranking-content');
  const paginationContainer = document.getElementById('pagination');
  
  try {
    let results;
    
    switch(currentType) {
      case 'anime':
        results = await jikan.getTopAnime(currentFilter, currentPage, 25);
        break;
      case 'manga':
        results = await jikan.getTopManga(currentFilter, currentPage, 25);
        break;
      case 'characters':
        results = await jikan.getTopCharacters(currentPage, 25);
        break;
      case 'people':
        results = await jikan.getTopPeople(currentPage, 25);
        break;
      case 'reviews':
        results = await jikan.getTopReviews(currentPage, 25);
        break;
      default:
        results = await jikan.getTopAnime(currentFilter, currentPage, 25);
    }

    renderRanking(results.data, results.pagination);
    
  } catch (error) {
    console.error('Top ranking error:', error);
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error loading rankings. Please try again.</p>
      </div>
    `;
  }
}

function renderRanking(data, pagination) {
  const contentContainer = document.getElementById('ranking-content');
  const paginationContainer = document.getElementById('pagination');
  
  contentContainer.innerHTML = `
    <div class="ranking-list">
      ${data.map((item, index) => createRankingRow(item, index + 1 + (currentPage - 1) * 25)).join('')}
    </div>
  `;
  
  // Style untuk ranking rows
  const style = document.createElement('style');
  style.textContent = `
    .ranking-list { display: flex; flex-direction: column; gap: 8px; }
    .ranking-row { 
      display: grid; 
      grid-template-columns: 60px 80px 1fr 120px 100px 100px; 
      align-items: center; 
      padding: 16px; 
      background: var(--bg-card); 
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .ranking-row:hover { 
      background: var(--bg-hover); 
      transform: translateX(4px);
    }
    .ranking-rank { 
      font-size: 1.5rem; 
      font-weight: 800; 
      color: var(--accent-tertiary);
      text-align: center;
    }
    .ranking-rank.top-3 { color: var(--accent-primary); }
    .ranking-image { 
      width: 60px; 
      height: 80px; 
      border-radius: 8px; 
      overflow: hidden;
    }
    .ranking-image img { width: 100%; height: 100%; object-fit: cover; }
    .ranking-title { padding: 0 16px; }
    .ranking-title h4 { 
      font-size: 1rem; 
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .ranking-title span { font-size: 0.85rem; color: var(--text-muted); }
    .ranking-score { 
      font-weight: 700; 
      color: var(--accent-tertiary);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ranking-score::before { content: '★'; font-size: 0.9rem; }
    .ranking-members,
    .ranking-type { font-size: 0.9rem; color: var(--text-secondary); text-align: center; }
    
    @media (max-width: 768px) {
      .ranking-row { grid-template-columns: 50px 60px 1fr 80px; gap: 8px; }
      .ranking-members, .ranking-type { display: none; }
    }
  `;
  document.head.appendChild(style);
  
  // Filter button listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      currentPage = 1;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadRanking();
      updateURL();
    });
  });
  
  // Pagination
  if (pagination.last_visible_page > 1) {
    paginationContainer.appendChild(
      createPagination(
        currentPage,
        pagination.has_next_page,
        (page) => {
          currentPage = page;
          updateURL();
          loadRanking();
          window.scrollTo(0, 0);
        },
        pagination.last_visible_page
      )
    );
  }
}

function createRankingRow(item, rank) {
  const isCharacter = currentType === 'characters';
  const isPerson = currentType === 'people';
  const isReview = currentType === 'reviews';
  
  if (isReview) {
    return `
      <div class="review-card" onclick="router.navigate('/${item.entry.type}/${item.entry.mal_id}')" style="cursor: pointer;">
        <div class="review-header">
          <div class="review-author">
            <div class="review-avatar">
              <img src="${item.user.images.jpg.image_url}" alt="${item.user.username}">
            </div>
            <div class="review-meta">
              <h4>${item.user.username}</h4>
              <span>${item.entry.title}</span>
            </div>
          </div>
          <div class="review-score">${item.score}</div>
        </div>
        <div class="review-body">${item.review.substring(0, 200)}...</div>
      </div>
    `;
  }
  
  const score = item.score ? item.score.toFixed(2) : 'N/A';
  const rankClass = rank <= 3 ? 'top-3' : '';
  const imageUrl = item.images?.jpg?.image_url || item.images?.jpg?.small_image_url;
  const title = item.title || item.name;
  const url = isCharacter ? `/character/${item.mal_id}` : 
              isPerson ? `/people/${item.mal_id}` : 
              `/${currentType}/${item.mal_id}`;
  
  return `
    <div class="ranking-row" onclick="router.navigate('${url}')">
      <div class="ranking-rank ${rankClass}">#${rank}</div>
      <div class="ranking-image">
        <img src="${imageUrl}" alt="${title}" loading="lazy">
      </div>
      <div class="ranking-title">
        <h4>${title}</h4>
        <span>${isCharacter || isPerson ? `${item.favorites?.toLocaleString() || 0} favorites` : item.type || 'TV'}</span>
      </div>
      <div class="ranking-score">${score}</div>
      <div class="ranking-members">${item.members?.toLocaleString() || item.favorites?.toLocaleString() || 0}</div>
      <div class="ranking-type">${item.episodes || item.chapters || item.volumes || '-'}</div>
    </div>
  `;
}

function updateURL() {
  const params = new URLSearchParams();
  if (currentPage > 1) params.set('page', currentPage);
  if (currentFilter !== getDefaultFilter(currentType)) params.set('filter', currentFilter);
  router.navigate(`/top/${currentType}?${params.toString()}`, true);
}