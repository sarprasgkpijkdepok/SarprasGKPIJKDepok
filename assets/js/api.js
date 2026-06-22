/**
 * API Helper - Sarpras GKPI v7.1
 * - GET fetch with localStorage cache
 * - POST for CRUD & audit log (no CORS preflight)
 */
var SarprasAPI = {

  _cacheKey: function(sheet) {
    return 'sarpras_cache_' + sheet;
  },

  _cacheTimeKey: function(sheet) {
    return 'sarpras_time_' + sheet;
  },

  fetch: async function(sheet, forceRefresh) {
    sheet = sheet || 'all';
    var cacheKey = this._cacheKey(sheet);
    var timeKey = this._cacheTimeKey(sheet);
    var cacheDuration = CONFIG.CACHE_DURATION_MIN * 60 * 1000;

    if (!forceRefresh) {
      var cached = localStorage.getItem(cacheKey);
      var cachedTime = parseInt(localStorage.getItem(timeKey) || '0');
      if (cached && (Date.now() - cachedTime) < cacheDuration) {
        console.log('[API] Cache hit: ' + sheet);
        return JSON.parse(cached);
      }
    }

    try {
      console.log('[API] Fetching: ' + sheet);
      var url = CONFIG.API_URL + '?sheet=' + sheet + '&t=' + Date.now();
      var res = await fetch(url);
      var json = await res.json();
      if (json.status === 'success') {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        localStorage.setItem(timeKey, Date.now().toString());
        return json.data;
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err) {
      console.error('[API] Fetch error:', err);
      var stale = localStorage.getItem(cacheKey);
      if (stale) {
        console.warn('[API] Using stale cache as fallback');
        return JSON.parse(stale);
      }
      throw err;
    }
  },

  post: async function(payload) {
    try {
      console.log('[API] POST:', payload.action);
      var res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      var text = await res.text();
      var json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('Response bukan JSON: ' + text.substring(0, 150));
      }
      this.clearCache();
      if (json.data && json.data.error) {
        throw new Error(json.data.error);
      }
      return json;
    } catch (err) {
      console.error('[API] POST error:', err);
      throw err;
    }
  },

  logAudit: async function(event, page, detail) {
    try {
      await this.post({
        action: 'audit',
        event: event,
        page: page,
        detail: detail || '',
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.warn('[API] Audit log failed:', err.message);
    }
  },

  clearCache: function() {
    var keys = Object.keys(localStorage).filter(function(k) {
      return k.indexOf('sarpras_') === 0;
    });
    keys.forEach(function(k) {
      localStorage.removeItem(k);
    });
    console.log('[API] Cache cleared');
  },

  getLastUpdate: function(sheet) {
    sheet = sheet || 'all';
    var t = localStorage.getItem(this._cacheTimeKey(sheet));
    return t ? new Date(parseInt(t)) : null;
  }
};
