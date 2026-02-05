import { jikan } from '../api/jikan.js';
import { Skeleton } from '../components/loader.js';
import { createPagination } from '../components/pagination.js';
import { router } from '../components/router.js';

export async function animeDetailPage({ params }) {
  const { id } = params;
  const main = document.getElementById('app');
  
  // Skeleton loading
  main.innerHTML = `
    <div class="container">
      <div class="detail-hero">
        <div class="skeleton" style="position: absolute; inset: 0; border-radius: 0;"></div>
        <div class="detail-content" style="position: relative;">
          ${Skeleton.detail()}
        </div>
      </div>
    </div>
  `;

  try {
    // Fetch all anime data in parallel
    const [
      animeRes,
      charactersRes,
      staffRes,
      episodesRes,
      videosRes,
      statsRes,
      themesRes,
      externalRes,
      streamingRes,
      relationsRes,
      recommendationsRes,
      reviewsRes
    ] = await Promise.all([
      jikan.getAnime(id),
      jikan.getAnimeCharacters(id),
      jikan.getAnimeStaff(id),
      jikan.getAnimeEpisodes(id, 1),
      jikan.getAnimeVideos(id),
      jikan.getAnimeStatistics(id),
      jikan.getAnimeThemes(id),
      jikan.getAnimeExternal(id),
      jikan.getAnimeStreaming(id),
      jikan.getAnimeRelations(id),
      jikan.getAnimeRecommendations(id),
      jikan.getAnimeReviews(id, 1)
    ]);

    const anime = animeRes.data;
    
    renderAnimeDetail({
      anime,
      characters: charactersRes.data,
      staff: staffRes.data,
      episodes: episodesRes.data,
      videos: videosRes.data,
      stats: statsRes.data,
      themes: themesRes.data,
      external: externalRes.data,
      streaming: streamingRes.data,
      relations: relationsRes.data,
      recommendations: recommendationsRes.data,
      reviews: reviewsRes.data
    });

  } catch (error) {
    console.error('Anime detail error:', error);
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 20px;">
        <h2>Failed to Load Anime</h2>
        <p style="color: var(--text-muted); margin-top: 16px;">${error.message}</p>
        <button class="btn btn-primary" onclick="router.navigate('/')" style="margin-top: 24px;">
          Go Home
        </button>
      </div>
    `;
  }
}

function renderAnimeDetail(data) {
  const { anime, characters, staff, episodes, videos, stats, themes, external, streaming, relations, recommendations, reviews } = data;
  const main = document.getElementById('app');
  
  const scoreClass = anime.score >= 8 ? 'score-great' : 
                     anime.score >= 7 ? 'score-good' : 
                     anime.score >= 6 ? 'score-average' : 'score-bad';

  main.innerHTML = `
    <div class="detail-hero">
      <div class="detail-bg" style="background-image: url('${anime.images.jpg.large_image_url}')"></div>
      <div class="container detail-content">
        <aside class="detail-sidebar">
          <div class="detail-poster">
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
          </div>
          <div class="detail-actions">
            ${streaming.length > 0 ? `
              <a href="${streaming[0].url}" target="_blank" class="btn btn-primary" style="width: 100%;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Watch on ${streaming[0].name}
              </a>
            ` : ''}
            <button class="btn btn-secondary" style="width: 100%;" onclick="window.open('https://myanimelist.net/anime/${anime.mal_id}', '_blank')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              MyAnimeList
            </button>
          </div>
          
          <div class="detail-section" style="background: var(--bg-card); padding: 20px; border-radius: 12px;">
            <h3 style="margin-bottom: 16px; font-size: 1.1rem;">Information</h3>
            <div class="info-list" style="display: flex; flex-direction: column; gap: 12px;">
              <div class="info-item">
                <span class="info-label">Type</span>
                <span class="info-value">${anime.type || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Episodes</span>
                <span class="info-value">${anime.episodes || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">${anime.status || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Aired</span>
                <span class="info-value">${anime.aired?.string || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Premiered</span>
                <span class="info-value">${anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1) + ' ' + anime.year : 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Broadcast</span>
                <span class="info-value">${anime.broadcast?.string || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Source</span>
                <span class="info-value">${anime.source || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Genres</span>
                <span class="info-value">${anime.genres?.map(g => `<a href="/genre/${g.mal_id}" onclick="event.preventDefault(); router.navigate('/genre/${g.mal_id}')">${g.name}</a>`).join(', ') || 'None'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Themes</span>
                <span class="info-value">${anime.themes?.map(t => t.name).join(', ') || 'None'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Demographics</span>
                <span class="info-value">${anime.demographics?.map(d => d.name).join(', ') || 'None'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duration</span>
                <span class="info-value">${anime.duration || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Rating</span>
                <span class="info-value">${anime.rating || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Studios</span>
                <span class="info-value">${anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Producers</span>
                <span class="info-value">${anime.producers?.map(p => p.name).join(', ') || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </aside>

        <div class="detail-main">
          <h1>${anime.title}</h1>
          ${anime.title_english && anime.title_english !== anime.title ? `<p class="detail-alt-titles">${anime.title_english}</p>` : ''}
          ${anime.title_japanese ? `<p class="detail-alt-titles">${anime.title_japanese}</p>` : ''}
          
          <div class="detail-stats">
            <div class="stat-item">
              <span class="stat-label">Score</span>
              <span class="stat-value score ${scoreClass}">${anime.score ? anime.score.toFixed(2) : 'N/A'}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${anime.scored_by?.toLocaleString() || 0} users</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Ranked</span>
              <span class="stat-value">#${anime.rank || 'N/A'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Popularity</span>
              <span class="stat-value">#${anime.popularity || 'N/A'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Members</span>
              <span class="stat-value">${anime.members?.toLocaleString() || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Favorites</span>
              <span class="stat-value">${anime.favorites?.toLocaleString() || 0}</span>
            </div>
          </div>

          ${videos.promo?.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Trailer
              </h2>
              <div class="video-player" style="margin-top: 16px;">
                ${videos.promo[0].trailer?.embed_url ? `
                  <iframe 
                    src="${videos.promo[0].trailer.embed_url}" 
                    style="width: 100%; height: 100%; border: none;"
                    allowfullscreen
                  ></iframe>
                ` : `
                  <img src="${videos.promo[0].trailer.images?.maximum_image_url || anime.images.jpg.large_image_url}" alt="Trailer thumbnail">
                  <div class="video-overlay">
                    <a href="${videos.promo[0].trailer.url}" target="_blank" class="video-play-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </a>
                  </div>
                `}
              </div>
            </div>
          ` : ''}

          <div class="detail-section">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Synopsis
            </h2>
            <p class="synopsis-text">${anime.synopsis || 'No synopsis available.'}</p>
            ${anime.background ? `<p class="synopsis-text" style="margin-top: 16px;"><strong>Background:</strong> ${anime.background}</p>` : ''}
          </div>

          ${themes.openings?.length > 0 || themes.endings?.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                Themes
              </h2>
              ${themes.openings?.length > 0 ? `
                <div style="margin-bottom: 20px;">
                  <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-secondary);">Openings</h3>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                    ${themes.openings.map(op => `<li style="font-size: 0.95rem; padding: 8px 12px; background: var(--bg-card); border-radius: 8px;">${op}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${themes.endings?.length > 0 ? `
                <div>
                  <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-secondary);">Endings</h3>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                    ${themes.endings.map(ed => `<li style="font-size: 0.95rem; padding: 8px 12px; background: var(--bg-card); border-radius: 8px;">${ed}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${episodes.length > 0 ? `
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
                Episodes (${anime.episodes || '?'})
              </h2>
              <div class="episode-list">
                ${episodes.slice(0, 10).map(ep => `
                  <div class="episode-item">
                    <div class="episode-number">${ep.mal_id}</div>
                    <div class="episode-details">
                      <h4>${ep.title || `Episode ${ep.mal_id}`}</h4>
                      ${ep.title_japanese ? `<p>${ep.title_japanese}</p>` : ''}
                    </div>
                    <span class="episode-date">${ep.aired ? new Date(ep.aired).toLocaleDateString() : 'TBA'}</span>
                  </div>
                `).join('')}
              </div>
              ${episodes.length > 10 ? `
                <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;" onclick="alert('Full episode list coming soon')">
                  View All Episodes
                </button>
              ` : ''}
            </div>
          ` : ''}

          ${characters.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Characters & Voice Actors
              </h2>
              <div class="character-grid">
                ${characters.slice(0, 6).map(char => `
                  <div class="character-item" onclick="router.navigate('/character/${char.character.mal_id}')">
                    <div class="character-image">
                      <img src="${char.character.images.jpg.image_url}" alt="${char.character.name}">
                    </div>
                    <div class="character-details">
                      <h4>${char.character.name}</h4>
                      <p>${char.role}</p>
                      ${char.voice_actors?.[0] ? `
                        <span class="character-voice">VA: ${char.voice_actors[0].person.name}</span>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              ${characters.length > 6 ? `
                <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;" onclick="alert('Full character list coming soon')">
                  View All Characters
                </button>
              ` : ''}
            </div>
          ` : ''}

          ${staff.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Staff
              </h2>
              <div class="character-grid">
                ${staff.slice(0, 4).map(s => `
                  <div class="character-item" onclick="router.navigate('/people/${s.person.mal_id}')">
                    <div class="character-image">
                      <img src="${s.person.images.jpg.image_url}" alt="${s.person.name}">
                    </div>
                    <div class="character-details">
                      <h4>${s.person.name}</h4>
                      <p>${s.positions.join(', ')}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${reviews.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Reviews
              </h2>
              ${reviews.slice(0, 3).map(review => `
                <div class="review-card">
                  <div class="review-header">
                    <div class="review-author">
                      <div class="review-avatar">
                        <img src="${review.user.images.jpg.image_url}" alt="${review.user.username}">
                      </div>
                      <div class="review-meta">
                        <h4>${review.user.username}</h4>
                        <span>${new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div class="review-score">${review.score}</div>
                  </div>
                  <div class="review-body">${review.review}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${recommendations.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                Recommendations
              </h2>
              <div class="grid-section grid-4">
                ${recommendations.slice(0, 4).map(rec => `
                  <div class="anime-card" onclick="router.navigate('/anime/${rec.entry.mal_id}')">
                    <div class="card-image">
                      <img src="${rec.entry.images.jpg.image_url}" alt="${rec.entry.title}">
                    </div>
                    <div class="card-content">
                      <h3 class="card-title">${rec.entry.title}</h3>
                      <div class="card-meta">
                        <span>${rec.votes} votes</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${relations.length > 0 ? `
            <div class="detail-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Related Anime
              </h2>
              <div class="episode-list">
                ${relations.map(rel => `
                  <div class="episode-item" onclick="router.navigate('/anime/${rel.entry[0].mal_id}')" style="cursor: pointer;">
                    <div class="episode-details">
                      <h4>${rel.entry[0].name}</h4>
                      <p style="color: var(--accent-primary); font-size: 0.85rem;">${rel.relation}</p>
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