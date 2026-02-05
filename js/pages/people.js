import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { router } from '../components/router.js';

export async function peoplePage({ params }) {
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
      personRes,
      animeRes,
      voicesRes,
      mangaRes,
      picturesRes
    ] = await Promise.all([
      jikan.getPerson(id),
      jikan.getPersonAnime(id),
      jikan.getPersonVoices(id),
      jikan.getPersonManga(id),
      jikan.getPersonPictures(id)
    ]);

    const person = personRes.data;

    renderPeopleDetail({
      person,
      anime: animeRes.data,
      voices: voicesRes.data,
      manga: mangaRes.data,
      pictures: picturesRes.data
    });

  } catch (error) {
    console.error('People detail error:', error);
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 20px;">
        <h2>Failed to Load Person</h2>
        <p style="color: var(--text-muted); margin-top: 16px;">${error.message}</p>
        <button class="btn btn-primary" onclick="router.navigate('/')" style="margin-top: 24px;">
          Go Home
        </button>
      </div>
    `;
  }
}

function renderPeopleDetail(data) {
  const { person, anime, voices, manga, pictures } = data;
  const main = document.getElementById('app');

  const isVoiceActor = voices.length > 0;
  const givenName = person.given_name || '';
  const familyName = person.family_name || '';

  main.innerHTML = `
    <div class="container" style="padding-top: 40px;">
      <div class="detail-content">
        <aside class="detail-sidebar">
          <div class="detail-poster">
            <img src="${person.images.jpg.image_url}" alt="${person.name}">
          </div>
          
          <div class="detail-section" style="background: var(--bg-card); padding: 20px; border-radius: 12px;">
            <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Information</h3>
            <div class="info-list" style="display: flex; flex-direction: column; gap: 12px;">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">${person.name}</span>
              </div>
              ${givenName || familyName ? `
                <div class="info-item">
                  <span class="info-label">Given/Family</span>
                  <span class="info-value">${givenName} ${familyName}</span>
                </div>
              ` : ''}
              ${person.alternate_names?.length > 0 ? `
                <div class="info-item">
                  <span class="info-label">Alternate Names</span>
                  <span class="info-value">${person.alternate_names.join(', ')}</span>
                </div>
              ` : ''}
              ${person.birthday ? `
                <div class="info-item">
                  <span class="info-label">Birthday</span>
                  <span class="info-value">${new Date(person.birthday).toLocaleDateString()}</span>
                </div>
              ` : ''}
              ${person.age ? `
                <div class="info-item">
                  <span class="info-label">Age</span>
                  <span class="info-value">${person.age}</span>
                </div>
              ` : ''}
              ${person.height ? `
                <div class="info-item">
                  <span class="info-label">Height</span>
                  <span class="info-value">${person.height}</span>
                </div>
              ` : ''}
              ${person.weight ? `
                <div class="info-item">
                  <span class="info-label">Weight</span>
                  <span class="info-value">${person.weight}</span>
                </div>
              ` : ''}
              ${person.blood_type ? `
                <div class="info-item">
                  <span class="info-label">Blood Type</span>
                  <span class="info-value">${person.blood_type}</span>
                </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Favorites</span>
                <span class="info-value">${person.favorites?.toLocaleString() || 0}</span>
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
          <h1>${person.name}</h1>
          ${givenName || familyName ? `<p class="detail-alt-titles">${givenName} ${familyName}</p>` : ''}

          ${person.about ? `
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
              <p class="synopsis-text" style="white-space: pre-line;">${person.about}</p>
            </div>
          ` : ''}

          ${isVoiceActor && voices.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Voice Acting Roles (${voices.length})
              </h2>
              <div class="character-grid">
                ${voices.slice(0, 8).map(voice => `
                  <div class="character-item" onclick="router.navigate('/character/${voice.character.mal_id}')">
                    <div class="character-image">
                      <img src="${voice.character.images.jpg.image_url}" alt="${voice.character.name}">
                    </div>
                    <div class="character-details">
                      <h4>${voice.character.name}</h4>
                      <p>${voice.anime.title}</p>
                      <span class="character-voice">${voice.role}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              ${voices.length > 8 ? `
                <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;">
                  View All Roles
                </button>
              ` : ''}
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
                Anime Staff Positions
              </h2>
              <div class="episode-list">
                ${anime.slice(0, 10).map(item => `
                  <div class="episode-item" onclick="router.navigate('/anime/${item.anime.mal_id}')" style="cursor: pointer;">
                    <div class="episode-details">
                      <h4>${item.anime.title}</h4>
                      <p style="color: var(--accent-primary); font-size: 0.85rem;">${item.positions.join(', ')}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              ${anime.length > 10 ? `
                <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;">
                  View All Positions
                </button>
              ` : ''}
            </div>
          ` : ''}

          ${manga.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Manga Positions
              </h2>
              <div class="episode-list">
                ${manga.slice(0, 10).map(item => `
                  <div class="episode-item" onclick="router.navigate('/manga/${item.manga.mal_id}')" style="cursor: pointer;">
                    <div class="episode-details">
                      <h4>${item.manga.title}</h4>
                      <p style="color: var(--accent-primary); font-size: 0.85rem;">${item.positions.join(', ')}</p>
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