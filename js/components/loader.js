/**
 * Skeleton Loading Components
 */

export const Skeleton = {
  // Card skeleton
  card() {
    return `
      <div class="skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    `;
  },

  // Multiple cards
  cards(count = 6) {
    return Array(count).fill(0).map(() => this.card()).join('');
  },

  // Detail page skeleton
  detail() {
    return `
      <div class="detail-content">
        <div class="detail-sidebar">
          <div class="skeleton" style="aspect-ratio: 3/4; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 48px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 48px; border-radius: 12px;"></div>
        </div>
        <div>
          <div class="skeleton" style="height: 40px; width: 60%; margin-bottom: 20px;"></div>
          <div class="skeleton" style="height: 20px; width: 40%; margin-bottom: 30px;"></div>
          <div class="skeleton" style="height: 100px; margin-bottom: 30px;"></div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            ${Array(6).fill('<div class="skeleton" style="height: 60px;"></div>').join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Episode list skeleton
  episodes(count = 5) {
    return Array(count).fill(0).map(() => `
      <div class="episode-item">
        <div class="skeleton" style="width: 48px; height: 48px; border-radius: 8px;"></div>
        <div style="flex: 1;">
          <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 16px; width: 40%;"></div>
        </div>
      </div>
    `).join('');
  },

  // Character list skeleton
  characters(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="character-item">
        <div class="skeleton" style="width: 80px; height: 100px; border-radius: 8px;"></div>
        <div style="flex: 1;">
          <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 16px; width: 50%;"></div>
        </div>
      </div>
    `).join('');
  },

  // Ranking table skeleton
  ranking(count = 10) {
    return Array(count).fill(0).map(() => `
      <div class="ranking-row">
        <div class="skeleton" style="width: 40px; height: 30px;"></div>
        <div class="skeleton" style="width: 60px; height: 80px;"></div>
        <div style="flex: 1;">
          <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 16px; width: 60%;"></div>
        </div>
        <div class="skeleton" style="width: 60px; height: 30px;"></div>
      </div>
    `).join('');
  }
};