import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { router } from '../components/router.js';

export async function characterPage({ params }) {
  const { id } = params;
  const main = document.getElementById('app');
  
  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <div class="detail-content">
        ${Skeleton.detail()}
      </div>
    </div>
  `;

  try {
    const [
      characterRes,
      animeRes,
      mangaRes,
      voicesRes,
      picturesRes
    ] = await Promise.all([
      jikan.getCharacter(id),
      jikan.getCharacterAnime(id),
      jikan.getCharacterManga(id),
      jikan.getCharacterVoices(id),
      jikan.getCharacterPictures(id)
    ]);

    const character = characterRes.data;

    renderCharacterDetail({
      character,
      anime: animeRes.data,
      manga: mangaRes.data,
      voices: voicesRes.data,
      pictures: picturesRes.data
    });

  } catch (error) {
    console.error('Character detail error:', error);
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 20px;">
        <h2>Failed to Load Character</h2>
        <p style="color: var(--text-muted); margin-top: 16px;">${error.message}</p>
        <button class="btn btn-primary" onclick="router.navigate('/')" style="margin-top: 24px;">
          Go Home
        </button>
      </div>
    `;
  }
}

function renderCharacterDetail(data) {
  const { character, anime, manga, voices, pictures } = data;
  const main = document.getElementById('app');

  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <div class="detail-content">
        <aside class="detail-sidebar">
          <div class="detail-poster">
            <img src="${character.images.jpg.image_url}" alt="${character.name}">
          </div>
          
          <div class="detail-section" style="background: var(--bg-card); padding: 20px; border-radius: 12px;">
            <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Information</h3>
            <div class="info-list" style="display: flex; flex-direction: column; gap: 12px;">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">${character.name}</span>
              </div>
              ${character.name_kanji ? `
                <div class="info-item">
                  <span class="info-label">Kanji</span>
                  <span class="info-value">${character.name_kanji}</span>
                </div>
              ` : ''}
              ${character.nicknames?.length > 0 ? `
                <div class="info-item">
                  <span class="info-label">Nicknames</span>
                  <span class="info-value">${character.nicknames.join(', ')}</span>
                </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Favorites</span>
                <span class="info-value">${character.favorites?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          ${pictures.length > 0 ? `
            <div class="detail-section" style="background: var(--bg-card); padding: 20px; border-radius: 12px;">
              <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Gallery</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                ${pictures.slice(0, 4).map(pic => `
                  <img src="${pic.jpg.image_url}" style="width: 100%; border-radius: 8px; cursor: pointer;" onclick="window.open('${pic.jpg.large_image_url}', '_blank')">
                `).join('')}
              </div>
            </div>
          ` : ''}
        </aside>

        <div class="detail-main">
          <h1>${character.name}</h1>
          ${character.name_kanji ? `<p class="detail-alt-titles">${character.name_kanji}</p>` : ''}

          ${character.about ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                About
              </h2>
              <p class="synopsis-text" style="white-space: pre-line;">${character.about}</p>
            </div>
          ` : ''}

          ${voices.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Voice Actors
              </h2>
              <div class="character-grid">
                ${voices.slice(0, 6).map(voice => `
                  <div class="character-item" onclick="router.navigate('/people/${voice.person.mal_id}')">
                    <div class="character-image">
                      <img src="${voice.person.images.jpg.image_url}" alt="${voice.person.name}">
                    </div>
                    <div class="character-details">
                      <h4>${voice.person.name}</h4>
                      <p>${voice.language}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${anime.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="2" y1="7" x2="7" y2="7"></line>
                  <line x1="2" y1="17" x2="7" y2="17"></line>
                  <line x1="17" y1="17" x2="22" y2="17"></line>
                  <line x1="17" y1="7" x2="22" y2="7"></line>
                </svg>
                Anime Appearances
              </h2>
              <div class="grid-section grid-4">
                ${anime.slice(0, 8).map(item => `
                  <div class="anime-card" onclick="router.navigate('/anime/${item.anime.mal_id}')">
                    <div class="card-image">
                      <img src="${item.anime.images.jpg.image_url}" alt="${item.anime.title}">
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">${item.anime.title}</h3>
                      <div class="card-meta">
                        <span>${item.role}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${manga.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Manga Appearances
              </h2>
              <div class="grid-section grid-4">
                ${manga.slice(0, 8).map(item => `
                  <div class="manga-card" onclick="router.navigate('/manga/${item.manga.mal_id}')">
                    <div class="card-image">
                      <img src="${item.manga.images.jpg.image_url}" alt="${item.manga.title}">
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">${item.manga.title}</h3>
                      <div class="card-meta">
                        <span>${item.role}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}