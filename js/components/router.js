/**
 * Simple SPA Router
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Handle initial route
    document.addEventListener('DOMContentLoaded', () => this.handleRoute());
    
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-router]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  on(path, handler) {
    // Convert route pattern to regex
    const pattern = path.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    this.routes.set(regex, { path, handler });
    return this;
  }

  beforeEach(hook) {
    this.beforeHooks.push(hook);
    return this;
  }

  afterEach(hook) {
    this.afterHooks.push(hook);
    return this;
  }

  navigate(path, replace = false) {
    const url = new URL(path, window.location.origin);
    
    if (replace) {
      window.history.replaceState({}, '', url.pathname + url.search);
    } else {
      window.history.pushState({}, '', url.pathname + url.search);
    }
    
    this.handleRoute();
  }

  getParams(routePath, actualPath) {
    const params = {};
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    routeParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const key = part.slice(1);
        params[key] = decodeURIComponent(actualParts[i]);
      }
    });
    
    return params;
  }

  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  async handleRoute() {
    const path = window.location.pathname;
    const query = this.getQueryParams();
    
    // Find matching route
    let matchedRoute = null;
    let matchResult = null;
    
    for (const [regex, route] of this.routes) {
      const match = path.match(regex);
      if (match) {
        matchedRoute = route;
        matchResult = match;
        break;
      }
    }
    
    if (!matchedRoute) {
      console.error('No route found for:', path);
      this.navigate('/404');
      return;
    }
    
    // Extract params
    const params = this.getParams(matchedRoute.path, path);
    
    // Execute before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook({ path, params, query });
      if (result === false) return; // Cancel navigation
    }
    
    // Execute route handler
    try {
      await matchedRoute.handler({ params, query });
      this.currentRoute = { path, params, query };
      
      // Update active nav link
      this.updateActiveNav(path);
      
      // Execute after hooks
      for (const hook of this.afterHooks) {
        await hook({ path, params, query });
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Route handler error:', error);
    }
  }

  updateActiveNav(currentPath) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || currentPath.startsWith(href) && href !== '/') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

export const router = new Router();