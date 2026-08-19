const Toast = {
  show(msg, type = "info") {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
};

const App = {
  init() {
    this.bindTabs();
    this.bindSearch();
    this.bindReviewModal();
    Pagination.init();
    DragDrop.init(document.getElementById("watchlist-items"));
    this.renderWatchlist();

    if (CONFIG.API_KEY === "YOUR_API_KEY_HERE") {
      Toast.show("Set your OMDb API key in js/config.js", "error");
    }
  },

  bindTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".tab-btn")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        document
          .getElementById(`tab-${btn.dataset.tab}`)
          .classList.add("active");
        if (btn.dataset.tab === "watchlist") this.renderWatchlist();
      });
    });
  },

  bindSearch() {
    const input = document.getElementById("search-input");
    const btn = document.getElementById("search-btn");

    const doSearch = () => {
      const q = input.value.trim();
      if (!q) {
        Toast.show("Enter a search term", "error");
        return;
      }
      const type = document.getElementById("search-type").value;
      Pagination.search(q, type);
    };

    btn.addEventListener("click", doSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSearch();
    });
  },

  bindReviewModal() {
    document.getElementById("modal-close-btn").addEventListener("click", () =>
      Reviews.closeModal()
    );
    document.getElementById("review-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) Reviews.closeModal();
    });

    document.querySelectorAll("#star-rating .star").forEach((star) => {
      star.addEventListener("click", () =>
        Reviews.setRating(Number(star.dataset.value))
      );
      star.addEventListener("mouseenter", () => {
        const val = Number(star.dataset.value);
        document.querySelectorAll("#star-rating .star").forEach((s) => {
          s.classList.toggle("active", Number(s.dataset.value) <= val);
        });
      });
      star.addEventListener("mouseleave", () => {
        const val = Number(document.getElementById("rating-value").value);
        document.querySelectorAll("#star-rating .star").forEach((s) => {
          s.classList.toggle("active", Number(s.dataset.value) <= val);
        });
      });
    });

    document.getElementById("review-text").addEventListener("input", (e) => {
      document.getElementById("char-count").textContent =
        e.target.value.length;
    });

    document.getElementById("review-form").addEventListener("submit", (e) =>
      Reviews.submit(e)
    );

    document.getElementById("clear-watchlist-btn").addEventListener("click", () => {
      if (confirm("Clear your entire watchlist?")) {
        Store.clearWatchlist();
        this.renderWatchlist();
        Toast.show("Watchlist cleared", "info");
      }
    });
  },

  renderSearchResults(movies, append = false) {
    const grid = document.getElementById("search-results");
    if (!append) grid.innerHTML = "";

    const frag = document.createDocumentFragment();
    movies.forEach((m, i) => {
      const card = document.createElement("div");
      card.className = "movie-card";
      const inWL = Store.isInWatchlist(m.imdbID);
      const poster =
        m.Poster && m.Poster !== "N/A"
          ? `<img class="poster" src="${m.Poster}" alt="${m.Title}" loading="lazy" />`
          : '<div class="poster-placeholder">🎬</div>';

      card.innerHTML = `
        ${poster}
        <div class="info">
          <div class="title">${m.Title}</div>
          <div class="meta">
            <span>${m.Year}</span>
            <span class="rating">${m.Type ? m.Type : ""}</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn-add ${inWL ? "in-watchlist" : ""}"
                  data-id="${m.imdbID}"
                  ${inWL ? "disabled" : ""}>
            ${inWL ? "✓ Added" : "+ Watchlist"}
          </button>
          <button class="btn-review" data-imdb="${m.imdbID}"
                  data-title="${m.Title}" data-year="${m.Year}"
                  data-poster="${m.Poster || ""}" data-type="${m.Type || ""}">
            Review
          </button>
        </div>
      `;
      card.querySelector(".btn-add").addEventListener("click", () => {
        Store.addToWatchlist(m);
        Toast.show(`"${m.Title}" added to watchlist`, "success");
        this.renderSearchResults([], false);
        Pagination.search(Pagination.lastQuery, Pagination.lastType, false);
      });
      card.querySelector(".btn-review").addEventListener("click", () => {
        Reviews.openModal({
          imdbID: m.imdbID,
          Title: m.Title,
          Year: m.Year,
          Poster: m.Poster,
          Type: m.Type,
        });
      });
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  },

  renderWatchlist() {
    const list = Store.getWatchlist();
    const container = document.getElementById("watchlist-items");
    const empty = document.getElementById("watchlist-empty");
    const count = document.getElementById("watchlist-count");

    count.textContent = String(list.length);
    empty.style.display = list.length === 0 ? "block" : "none";
    container.innerHTML = "";

    if (list.length === 0) return;

    const frag = document.createDocumentFragment();
    list.forEach((m, i) => {
      const el = document.createElement("div");
      el.className = "watchlist-item";
      el.draggable = true;
      el.dataset.index = String(i);
      const poster =
        m.Poster && m.Poster !== "N/A"
          ? `<img class="poster-sm" src="${m.Poster}" alt="${m.Title}" />`
          : '<div class="poster-sm" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">🎬</div>';

      el.innerHTML = `
        <span class="drag-handle">⠿</span>
        ${poster}
        <div class="item-info">
          <div class="item-title">${m.Title}</div>
          <div class="item-meta">${m.Year} &middot; ${m.Type}</div>
        </div>
        <div class="item-actions">
          <button class="btn-watch ${m.watched ? "watched" : ""}"
                  data-id="${m.imdbID}">
            ${m.watched ? "✓ Watched" : "Watch"}
          </button>
          <button class="btn-review" data-imdb="${m.imdbID}"
                  data-title="${m.Title}" data-year="${m.Year}"
                  data-poster="${m.Poster || ""}" data-type="${m.Type}">
            Review
          </button>
          <button class="btn-remove" data-id="${m.imdbID}">✕</button>
        </div>
      `;

      el.querySelector(".btn-remove").addEventListener("click", () => {
        Store.removeFromWatchlist(m.imdbID);
        Toast.show(`"${m.Title}" removed`, "info");
        this.renderWatchlist();
      });
      el.querySelector(".btn-watch").addEventListener("click", () => {
        Store.toggleWatched(m.imdbID);
        this.renderWatchlist();
      });
      el.querySelector(".btn-review").addEventListener("click", () => {
        Reviews.openModal(m);
      });

      frag.appendChild(el);
    });
    container.appendChild(frag);
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
