const Reviews = {
  currentMovieID: null,

  openModal(movie) {
    this.currentMovieID = movie.imdbID;
    const modal = document.getElementById("review-modal");
    const info = document.getElementById("modal-movie-info");

    info.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : ""}"
           alt="${movie.Title}"
           onerror="this.style.display='none'" />
      <div class="movie-detail">
        <h3>${movie.Title}</h3>
        <p>${movie.Year} &middot; ${movie.Type || "Movie"}</p>
      </div>
    `;

    document.getElementById("rating-value").value = "0";
    document.getElementById("review-text").value = "";
    document.getElementById("reviewer-name").value = "";
    document.getElementById("char-count").textContent = "0";
    this.clearErrors();
    this.resetStars();
    this.renderExistingReviews(movie.imdbID);

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    document.getElementById("review-modal").style.display = "none";
    document.body.style.overflow = "";
    this.currentMovieID = null;
  },

  clearErrors() {
    document.getElementById("rating-error").textContent = "";
    document.getElementById("review-error").textContent = "";
    document
      .querySelectorAll("#review-form .field-error")
      .forEach((el) => (el.textContent = ""));
  },

  resetStars() {
    document
      .querySelectorAll("#star-rating .star")
      .forEach((s) => s.classList.remove("active"));
  },

  setRating(value) {
    document.getElementById("rating-value").value = String(value);
    document.querySelectorAll("#star-rating .star").forEach((star) => {
      star.classList.toggle(
        "active",
        Number(star.dataset.value) <= value
      );
    });
  },

  validate() {
    let valid = true;
    this.clearErrors();

    const rating = Number(document.getElementById("rating-value").value);
    const text = document.getElementById("review-text").value.trim();

    if (rating < 1 || rating > 5) {
      document.getElementById("rating-error").textContent =
        "Please select a star rating (1-5).";
      valid = false;
    }

    if (text.length < CONFIG.REVIEW_MIN_LENGTH) {
      document.getElementById("review-error").textContent = `Review must be at least ${CONFIG.REVIEW_MIN_LENGTH} characters.`;
      valid = false;
    } else if (text.length > CONFIG.REVIEW_MAX_LENGTH) {
      document.getElementById("review-error").textContent = `Review must be at most ${CONFIG.REVIEW_MAX_LENGTH} characters.`;
      valid = false;
    }

    return valid;
  },

  submit(e) {
    e.preventDefault();
    if (!this.validate()) return;

    const review = {
      rating: Number(document.getElementById("rating-value").value),
      text: document.getElementById("review-text").value.trim(),
      author:
        document.getElementById("reviewer-name").value.trim() || "Anonymous",
    };

    Store.addReview(this.currentMovieID, review);
    Toast.show("Review saved!", "success");
    this.renderExistingReviews(this.currentMovieID);
    document.getElementById("review-text").value = "";
    document.getElementById("char-count").textContent = "0";
    this.resetStars();
    document.getElementById("rating-value").value = "0";
  },

  renderExistingReviews(imdbID) {
    const container = document.getElementById("existing-reviews");
    const reviews = Store.getReviews(imdbID);

    if (reviews.length === 0) {
      container.innerHTML = "";
      return;
    }

    const stars = (n) => "\u2605".repeat(n) + "\u2606".repeat(5 - n);
    const timeAgo = (ts) => {
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    };

    container.innerHTML = `
      <h4>Reviews (${reviews.length})</h4>
      ${reviews
        .map(
          (r) => `
        <div class="review-item">
          <div class="review-header">
            <span class="review-stars">${stars(r.rating)}</span>
            <span class="review-author">${this._esc(r.author)} &middot; ${timeAgo(r.createdAt)}</span>
          </div>
          <div class="review-body">${this._esc(r.text)}</div>
        </div>
      `
        )
        .join("")}
    `;
  },

  _esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  },
};
