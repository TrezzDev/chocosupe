import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

let currentTab = 'episodes';
let currentPage = 1;

export async function watchPage({ query }) {
  currentTab = query.tab || 'episodes';
  currentPage = parseInt(query.page) || 1;
  
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <h1 class="section-title">Watch</h1>
      
      <div class="watch-categories">
        <button class="watch-tab ${currentTab === 'episodes' ? 'active' : ''}" data-tab="episodes">
          Recent Episodes
        </button>
        <button class="watch-tab ${currentTab === 'popular-episodes' ? 'active' : ''}" data-tab="popular-episodes">
          Popular Episodes
        </button>
        <button class="watch-tab ${currentTab === 'promos' ? 'active' : ''}" data-tab="promos">
          Promos
        </button>
        <button class="watch-tab ${currentTab === 'popular-promos' ? 'active' : ''}" data-tab="popular-promos">
          Popular Promos
        </button>
      </div>
      
      <div id="watch-content">
        ${currentTab.includes('episodes') ? Skeleton.cards(8) : Skeleton.cards(6)}
      </div>
      
      <div id="pagination"></div>
    </div>
  `;

  // Event listeners
  document.querySelectorAll('.watch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.watch-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      currentPage = 1;
      updateURL();
      loadWatchContent();
    });
  });

  await loadWatchContent();
}

async function loadWatchContent() {
  const contentContainer = document.getElementById('watch-content');
  const paginationContainer = document.getElementById('pagination');
  
  contentContainer.innerHTML = currentTab.includes('episodes') ? Skeleton.cards(8) : Skeleton.cards(6);
  paginationContainer.innerHTML = '';
  
  try {
    let results;
    
    switch(currentTab) {
      case 'episodes':
        results = await jikan.getWatchEpisodes(currentPage);
        break;
      case 'popular-episodes':
        results = await jikan.getWatchPopularEpisodes(currentPage);
        break;
      case 'promos':
        results = await jikan.getWatchPromos(currentPage);
        break;
      case 'popular-promos':
        results = await jikan.getWatchPopularPromos(currentPage);
        break;
      default:
        results = await jikan.getWatchEpisodes(currentPage);
    }

    renderWatchContent(results.data, results.pagination);
    
  } catch (error) {
    console.error('Watch error:', error);
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error loading content. Please try again.</p>
      </div>
    `;
  }
}

function renderWatchContent(data, pagination) {
  const contentContainer = document.getElementById('watch-content');
  const paginationContainer = document.getElementById('pagination');
  
  if (data.length === 0) {
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>No content available.</p>
      </div>
    `;
    return;
  }

  if (currentTab.includes('episodes')) {
    contentContainer.innerHTML = `
      <div class="grid-section grid-2">
        ${data.map(item => createEpisodeCard(item)).join('')}
      </div>
    `;
  } else {
    contentContainer.innerHTML = `
      <div class="grid-section grid-3">
        ${data.map(item => createPromoCard(item)).join('')}
      </div>
    `;
  }
  
  if (pagination.last_visible_page > 1) {
    paginationContainer.appendChild(
      createPagination(
        currentPage,
        pagination.has_next_page,
        (page) => {
          currentPage = page;
          updateURL();
          loadWatchContent();
          window.scrollTo(0, 0);
        },
        pagination.last_visible_page
      )
    );
  }
}

function createEpisodeCard(item) {
  const episode = item.episodes[0];
  return `
    <div class="episode-card" onclick="router.navigate('/anime/${item.entry.mal_id}')">
      <div class="episode-thumbnail">
        <img src="${item.entry.images.jpg.large_image_url}" alt="${item.entry.title}">
        <div class="episode-play">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="episode-info">
        <h4>${item.entry.title}</h4>
        <p>${episode?.title || `Episode ${episode?.mal_id || ''}`}</p>
        <div class="episode-meta">
          <span>${episode?.premium ? 'Premium' : 'Free'}</span>
          <span>${new Date(episode?.aired || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  `;
}

function createPromoCard(item) {
  return `
    <div class="recommendation-card" onclick="window.open('${item.trailer.url}', '_blank')">
      <img src="${item.entry.images.jpg.large_image_url}" alt="${item.entry.title}">
      <div class="video-overlay">
        <div class="video-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="recommendation-overlay">
        <h4>${item.entry.title}</h4>
        <p>${item.title}</p>
      </div>
    </div>
  `;
}

function updateURL() {
  const params = new URLSearchParams();
  params.set('tab', currentTab);
  if (currentPage > 1) params.set('page', currentPage);
  router.navigate(`/watch?${params.toString()}`, true);
}