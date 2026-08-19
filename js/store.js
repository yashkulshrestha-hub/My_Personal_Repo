const Store = {
  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getWatchlist() {
    return this._get(CONFIG.STORAGE_KEYS.WATCHLIST);
  },

  saveWatchlist(list) {
    this._set(CONFIG.STORAGE_KEYS.WATCHLIST, list);
  },

  addToWatchlist(movie) {
    const list = this.getWatchlist();
    if (list.some((m) => m.imdbID === movie.imdbID)) return false;
    list.push({
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      Type: movie.Type || "movie",
      watched: false,
      addedAt: Date.now(),
    });
    this.saveWatchlist(list);
    return true;
  },

  removeFromWatchlist(imdbID) {
    const list = this.getWatchlist().filter((m) => m.imdbID !== imdbID);
    this.saveWatchlist(list);
  },

  toggleWatched(imdbID) {
    const list = this.getWatchlist();
    const item = list.find((m) => m.imdbID === imdbID);
    if (item) item.watched = !item.watched;
    this.saveWatchlist(list);
  },

  isInWatchlist(imdbID) {
    return this.getWatchlist().some((m) => m.imdbID === imdbID);
  },

  clearWatchlist() {
    this.saveWatchlist([]);
  },

  getReviews(imdbID) {
    return this._get(CONFIG.STORAGE_KEYS.REVIEWS).filter(
      (r) => r.imdbID === imdbID
    );
  },

  getAllReviews() {
    return this._get(CONFIG.STORAGE_KEYS.REVIEWS);
  },

  addReview(imdbID, review) {
    const reviews = this._get(CONFIG.STORAGE_KEYS.REVIEWS);
    reviews.push({
      imdbID,
      ...review,
      id: Date.now(),
      createdAt: Date.now(),
    });
    this._set(CONFIG.STORAGE_KEYS.REVIEWS, reviews);
  },
};
