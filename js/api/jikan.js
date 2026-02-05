/**
 * Jikan API v4 Wrapper dengan Rate Limiting & Caching
 * Rate Limit: 60 requests/minute, 3 requests/second
 */

const BASE_URL = 'https://api.jikan.moe/v4';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

class JikanAPI {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minInterval = 334; // ~3 requests/second (1000/3)
  }

  /**
   * Generate cache key dari URL dan params
   */
  getCacheKey(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return `${endpoint}${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Check cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Save to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Rate limiting dengan queue
   */
  async enqueueRequest(fn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      await this.delay(this.minInterval - timeSinceLastRequest);
    }
    
    const { fn, resolve, reject } = this.requestQueue.shift();
    
    try {
      this.lastRequestTime = Date.now();
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      // Process next request
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Core fetch dengan retry logic
   */
  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          const delay = Math.pow(2, i) * 1000;
          console.warn(`Rate limited, retrying in ${delay}ms...`);
          await this.delay(delay);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
  }

  /**
   * Main request method
   */
  async request(endpoint, params = {}, useCache = true) {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Cache hit:', cacheKey);
        return cached;
      }
    }
    
    // Build URL
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    // Enqueue request dengan rate limiting
    const data = await this.enqueueRequest(() => this.fetchWithRetry(url.toString()));
    
    // Cache response
    if (useCache && data) {
      this.setCache(cacheKey, data);
    }
    
    return data;
  }

  // ==================== ANIME ENDPOINTS ====================
  
  getAnime(id) {
    return this.request(`/anime/${id}`);
  }

  getAnimeCharacters(id) {
    return this.request(`/anime/${id}/characters`);
  }

  getAnimeStaff(id) {
    return this.request(`/anime/${id}/staff`);
  }

  getAnimeEpisodes(id, page = 1) {
    return this.request(`/anime/${id}/episodes`, { page });
  }

  getAnimeEpisode(id, episode) {
    return this.request(`/anime/${id}/episodes/${episode}`);
  }

  getAnimeVideos(id) {
    return this.request(`/anime/${id}/videos`);
  }

  getAnimePictures(id) {
    return this.request(`/anime/${id}/pictures`);
  }

  getAnimeStatistics(id) {
    return this.request(`/anime/${id}/statistics`);
  }

  getAnimeThemes(id) {
    return this.request(`/anime/${id}/themes`);
  }

  getAnimeExternal(id) {
    return this.request(`/anime/${id}/external`);
  }

  getAnimeStreaming(id) {
    return this.request(`/anime/${id}/streaming`);
  }

  getAnimeRelations(id) {
    return this.request(`/anime/${id}/relations`);
  }

  getAnimeRecommendations(id) {
    return this.request(`/anime/${id}/recommendations`);
  }

  getAnimeReviews(id, page = 1) {
    return this.request(`/anime/${id}/reviews`, { page });
  }

  getAnimeUserUpdates(id, page = 1) {
    return this.request(`/anime/${id}/userupdates`, { page });
  }

  // ==================== MANGA ENDPOINTS ====================
  
  getManga(id) {
    return this.request(`/manga/${id}`);
  }

  getMangaCharacters(id) {
    return this.request(`/manga/${id}/characters`);
  }

  getMangaPictures(id) {
    return this.request(`/manga/${id}/pictures`);
  }

  getMangaStatistics(id) {
    return this.request(`/manga/${id}/statistics`);
  }

  getMangaRelations(id) {
    return this.request(`/manga/${id}/relations`);
  }

  getMangaExternal(id) {
    return this.request(`/manga/${id}/external`);
  }

  getMangaRecommendations(id) {
    return this.request(`/manga/${id}/recommendations`);
  }

  getMangaReviews(id, page = 1) {
    return this.request(`/manga/${id}/reviews`, { page });
  }

  // ==================== CHARACTER ENDPOINTS ====================
  
  getCharacter(id) {
    return this.request(`/characters/${id}`);
  }

  getCharacterAnime(id) {
    return this.request(`/characters/${id}/anime`);
  }

  getCharacterManga(id) {
    return this.request(`/characters/${id}/manga`);
  }

  getCharacterVoices(id) {
    return this.request(`/characters/${id}/voices`);
  }

  getCharacterPictures(id) {
    return this.request(`/characters/${id}/pictures`);
  }

  // ==================== PEOPLE ENDPOINTS ====================
  
  getPerson(id) {
    return this.request(`/people/${id}`);
  }

  getPersonAnime(id) {
    return this.request(`/people/${id}/anime`);
  }

  getPersonManga(id) {
    return this.request(`/people/${id}/manga`);
  }

  getPersonVoices(id) {
    return this.request(`/people/${id}/voices`);
  }

  getPersonPictures(id) {
    return this.request(`/people/${id}/pictures`);
  }

  // ==================== SEARCH ENDPOINTS ====================
  
  searchAnime(query, filters = {}) {
    const params = {
      q: query,
      page: filters.page || 1,
      limit: filters.limit || 25,
      type: filters.type,
      status: filters.status,
      rating: filters.rating,
      genres: filters.genres?.join(','),
      order_by: filters.order_by,
      sort: filters.sort,
      min_score: filters.min_score,
      max_score: filters.max_score,
      start_date: filters.start_date,
      end_date: filters.end_date,
      sfw: filters.sfw !== false ? true : false
    };
    
    // Remove undefined params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key];
    });
    
    return this.request('/anime', params, false);
  }

  searchManga(query, filters = {}) {
    const params = {
      q: query,
      page: filters.page || 1,
      limit: filters.limit || 25,
      type: filters.type,
      status: filters.status,
      genres: filters.genres?.join(','),
      order_by: filters.order_by,
      sort: filters.sort,
      sfw: filters.sfw !== false ? true : false
    };
    
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) delete params[key];
    });
    
    return this.request('/manga', params, false);
  }

  searchCharacters(query, page = 1, limit = 25) {
    return this.request('/characters', { q: query, page, limit }, false);
  }

  searchPeople(query, page = 1, limit = 25) {
    return this.request('/people', { q: query, page, limit }, false);
  }

  // ==================== TOP ENDPOINTS ====================
  
  getTopAnime(filter = 'airing', page = 1, limit = 25) {
    return this.request('/top/anime', { filter, page, limit }, false);
  }

  getTopManga(filter = 'manga', page = 1, limit = 25) {
    return this.request('/top/manga', { filter, page, limit }, false);
  }

  getTopCharacters(page = 1, limit = 25) {
    return this.request('/top/characters', { page, limit }, false);
  }

  getTopPeople(page = 1, limit = 25) {
    return this.request('/top/people', { page, limit }, false);
  }

  getTopReviews(page = 1, limit = 25) {
    return this.request('/top/reviews', { page, limit }, false);
  }

  // ==================== SEASON ENDPOINTS ====================
  
  getSeasons() {
    return this.request('/seasons');
  }

  getSeasonNow() {
    return this.request('/seasons/now');
  }

  getSeasonUpcoming() {
    return this.request('/seasons/upcoming');
  }

  getSeason(year, season, page = 1) {
    return this.request(`/seasons/${year}/${season}`, { page }, false);
  }

  // ==================== SCHEDULE ENDPOINTS ====================
  
  getSchedules(filter = null, page = 1, limit = 25, kids = false, sfw = true) {
    const params = { page, limit, kids, sfw };
    if (filter) params.filter = filter;
    return this.request('/schedules', params, false);
  }

  // ==================== GENRE ENDPOINTS ====================
  
  getAnimeGenres() {
    return this.request('/genres/anime');
  }

  getMangaGenres() {
    return this.request('/genres/manga');
  }

  // ==================== RANDOM ENDPOINTS ====================
  
  getRandomAnime() {
    return this.request('/random/anime', {}, false);
  }

  getRandomManga() {
    return this.request('/random/manga', {}, false);
  }

  getRandomCharacter() {
    return this.request('/random/characters', {}, false);
  }

  getRandomPerson() {
    return this.request('/random/people', {}, false);
  }

  // ==================== WATCH ENDPOINTS ====================
  
  getWatchEpisodes(page = 1) {
    return this.request('/watch/episodes', { page }, false);
  }

  getWatchPopularEpisodes(page = 1) {
    return this.request('/watch/episodes/popular', { page }, false);
  }

  getWatchPromos(page = 1) {
    return this.request('/watch/promos', { page }, false);
  }

  getWatchPopularPromos(page = 1) {
    return this.request('/watch/promos/popular', { page }, false);
  }

  // ==================== RECOMMENDATIONS & REVIEWS ====================
  
  getRecentAnimeReviews(page = 1) {
    return this.request('/reviews/anime', { page }, false);
  }

  getRecentMangaReviews(page = 1) {
    return this.request('/reviews/manga', { page }, false);
  }

  getAnimeRecommendations(page = 1) {
    return this.request('/recommendations/anime', { page }, false);
  }

  getMangaRecommendations(page = 1) {
    return this.request('/recommendations/manga', { page }, false);
  }

  // ==================== PRODUCERS ====================
  
  getProducers(page = 1) {
    return this.request('/producers', { page }, false);
  }

  getProducer(id) {
    return this.request(`/producers/${id}`);
  }
}

// Export singleton instance
export const jikan = new JikanAPI();
