const Pagination = {
  currentPage: 1,
  totalResults: 0,
  totalPages: 0,
  lastQuery: "",
  lastType: "",
  isLoading: false,
  useInfiniteScroll: true,
  observer: null,

  init() {
    const sentinel = document.getElementById("infinite-scroll-sentinel");
    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          this.useInfiniteScroll &&
          this.currentPage < this.totalPages &&
          !this.isLoading
        ) {
          this.loadNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    this.observer.observe(sentinel);

    document.getElementById("prev-page-btn").addEventListener("click", () => {
      if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
    });
    document.getElementById("next-page-btn").addEventListener("click", () => {
      if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
    });
    document
      .getElementById("infinite-scroll-toggle")
      .addEventListener("change", (e) => {
        this.useInfiniteScroll = e.target.checked;
        document.getElementById("search-pagination").style.display =
          this.useInfiniteScroll ? "none" : this.totalPages > 0 ? "flex" : "none";
      });
  },

  async search(query, type = "", append = false) {
    if (this.isLoading) return;
    if (!append) {
      this.currentPage = 1;
      this.lastQuery = query;
      this.lastType = type;
      document.getElementById("search-results").innerHTML = "";
    }

    this.isLoading = true;
    this.showStatus("Searching...");

    try {
      const data = await MovieAPI.search(query, type, this.currentPage);
      this.isLoading = false;

      if (data.Response === "False") {
        if (!append) this.showStatus(data.Error || "No results found.", true);
        return;
      }

      this.totalResults = parseInt(data.totalResults, 10);
      this.totalPages = Math.ceil(this.totalResults / CONFIG.RESULTS_PER_PAGE);

      this.hideStatus();
      App.renderSearchResults(data.Search, append);
      this.updatePagination();
    } catch (err) {
      this.isLoading = false;
      this.showStatus("Failed to fetch movies. Check your API key and connection.", true);
    }
  },

  loadNextPage() {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.search(this.lastQuery, this.lastType, true);
  },

  goToPage(page) {
    this.currentPage = page;
    this.search(this.lastQuery, this.lastType, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  updatePagination() {
    const pag = document.getElementById("search-pagination");
    if (this.useInfiniteScroll || this.totalPages <= 1) {
      pag.style.display = "none";
      return;
    }
    pag.style.display = "flex";
    document.getElementById("prev-page-btn").disabled = this.currentPage <= 1;
    document.getElementById("next-page-btn").disabled =
      this.currentPage >= this.totalPages;
    document.getElementById("page-info").textContent =
      `Page ${this.currentPage} of ${this.totalPages} (${this.totalResults} results)`;
  },

  showStatus(msg, isError = false) {
    const el = document.getElementById("search-status");
    el.textContent = isError ? msg : "";
    el.style.display = "block";
    if (!isError) el.innerHTML = '<div class="spinner"></div>';
    if (isError) el.classList.add("error");
    else el.classList.remove("error");
  },

  hideStatus() {
    const el = document.getElementById("search-status");
    el.style.display = "none";
    el.innerHTML = "";
  },

  reset() {
    this.currentPage = 1;
    this.totalResults = 0;
    this.totalPages = 0;
    document.getElementById("search-results").innerHTML = "";
    this.hideStatus();
    document.getElementById("search-pagination").style.display = "none";
  },
};
