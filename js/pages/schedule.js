import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { router } from '../components/router.js';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'other', 'unknown'];
let currentDay = days[new Date().getDay() - 1] || 'monday';

export async function schedulePage() {
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <h1 class="section-title">Anime Schedule</h1>
      
      <div class="schedule-tabs">
        ${days.map(day => `
          <button class="schedule-tab ${day === currentDay ? 'active' : ''}" data-day="${day}">
            ${day.charAt(0).toUpperCase() + day.slice(1)}
          </button>
        `).join('')}
      </div>
      
      <div id="schedule-content">
        ${Skeleton.cards(8)}
      </div>
    </div>
  `;

  // Event listeners
  document.querySelectorAll('.schedule-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.schedule-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDay = tab.dataset.day;
      loadSchedule();
    });
  });

  await loadSchedule();
}

async function loadSchedule() {
  const contentContainer = document.getElementById('schedule-content');
  contentContainer.innerHTML = Skeleton.cards(8);
  
  try {
    const results = await jikan.getSchedules(currentDay === 'all' ? null : currentDay, 1, 25);
    renderSchedule(results.data);
  } catch (error) {
    console.error('Schedule error:', error);
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>Error loading schedule. Please try again.</p>
      </div>
    `;
  }
}

function renderSchedule(data) {
  const contentContainer = document.getElementById('schedule-content');
  
  if (data.length === 0) {
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p>No anime scheduled for ${currentDay}.</p>
      </div>
    `;
    return;
  }

  // Sort by broadcast time
  const sortedData = data.sort((a, b) => {
    const timeA = a.broadcast?.time || '00:00';
    const timeB = b.broadcast?.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  contentContainer.innerHTML = `
    <div class="schedule-grid">
      ${sortedData.map(anime => createScheduleCard(anime)).join('')}
    </div>
  `;
}

function createScheduleCard(anime) {
  const broadcastTime = anime.broadcast?.time || 'TBA';
  const broadcastTimezone = anime.broadcast?.timezone || 'JST';
  
  return `
    <div class="schedule-card" onclick="router.navigate('/anime/${anime.mal_id}')">
      <div class="schedule-time">${broadcastTime} ${broadcastTimezone}</div>
      <h3 class="schedule-title">${anime.title}</h3>
      <p class="schedule-meta">
        ${anime.type || 'TV'} • ${anime.episodes || '?'} eps • Score: ${anime.score || 'N/A'}
      </p>
      ${anime.genres?.length > 0 ? `
        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          ${anime.genres.slice(0, 3).map(g => `<span class="tag">${g.name}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}