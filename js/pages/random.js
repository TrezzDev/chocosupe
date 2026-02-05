import { jikan } from '../api/jikan.js';
import { router } from '../components/router.js';

export async function randomPage() {
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="random-container">
      <h1>Random Generator</h1>
      <p style="color: var(--text-muted); margin-bottom: 40px;">Can't decide what to watch? Let fate decide!</p>
      
      <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px;">
        <button class="btn btn-primary random-btn-large" onclick="getRandom('anime')">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          Random Anime
        </button>
        
        <button class="btn btn-primary random-btn-large" onclick="getRandom('manga')" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Random Manga
        </button>
        
        <button class="btn btn-primary random-btn-large" onclick="getRandom('character')" style="background: linear-gradient(135deg, #3498db, #2980b9);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Random Character
        </button>
        
        <button class="btn btn-primary random-btn-large" onclick="getRandom('person')" style="background: linear-gradient(135deg, #e67e22, #d35400);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Random Person
        </button>
      </div>
      
      <div id="random-result" class="random-result"></div>
    </div>
  `;
}

window.getRandom = async (type) => {
  const resultContainer = document.getElementById('random-result');
  const buttons = document.querySelectorAll('.random-btn-large');
  
  buttons.forEach(btn => btn.disabled = true);
  resultContainer.innerHTML = `
    <div style="padding: 40px;">
      <div class="skeleton" style="width: 200px; height: 300px; margin: 0 auto; border-radius: 12px;"></div>
      <div class="skeleton" style="width: 60%; height: 30px; margin: 20px auto 0;"></div>
    </div>
  `;
  
  try {
    let result;
    switch(type) {
      case 'anime':
        result = await jikan.getRandomAnime();
        router.navigate(`/anime/${result.data.mal_id}`);
        break;
      case 'manga':
        result = await jikan.getRandomManga();
        router.navigate(`/manga/${result.data.mal_id}`);
        break;
      case 'character':
        result = await jikan.getRandomCharacter();
        router.navigate(`/character/${result.data.mal_id}`);
        break;
      case 'person':
        result = await jikan.getRandomPerson();
        router.navigate(`/people/${result.data.mal_id}`);
        break;
    }
  } catch (error) {
    console.error('Random error:', error);
    resultContainer.innerHTML = `
      <div style="color: var(--error); padding: 20px;">
        <p>Error getting random ${type}. Please try again.</p>
      </div>
    `;
    buttons.forEach(btn => btn.disabled = false);
  }
};