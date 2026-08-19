const MovieAPI = {
  async search(query, type = "", page = 1) {
    const params = new URLSearchParams({
      apikey: CONFIG.API_KEY,
      s: query,
      page: String(page),
    });
    if (type) params.set("type", type);

    const res = await fetch(`${CONFIG.API_BASE}?${params}`);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  },

  async getDetails(imdbID) {
    const params = new URLSearchParams({
      apikey: CONFIG.API_KEY,
      i: imdbID,
      plot: "short",
    });
    const res = await fetch(`${CONFIG.API_BASE}?${params}`);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  },
};
