const DragDrop = {
  dragSrcIndex: null,

  init(container) {
    container.addEventListener("dragstart", (e) => {
      const item = e.target.closest(".watchlist-item");
      if (!item) return;
      this.dragSrcIndex = +item.dataset.index;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    container.addEventListener("dragend", (e) => {
      const item = e.target.closest(".watchlist-item");
      if (item) item.classList.remove("dragging");
      container
        .querySelectorAll(".watchlist-item")
        .forEach((el) => el.classList.remove("drag-over"));
      this.dragSrcIndex = null;
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const item = e.target.closest(".watchlist-item");
      if (!item) return;
      container
        .querySelectorAll(".watchlist-item")
        .forEach((el) => el.classList.remove("drag-over"));
      item.classList.add("drag-over");
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.target.closest(".watchlist-item");
      if (!target || this.dragSrcIndex === null) return;

      const dropIndex = +target.dataset.index;
      if (this.dragSrcIndex === dropIndex) return;

      const list = Store.getWatchlist();
      const [moved] = list.splice(this.dragSrcIndex, 1);
      list.splice(dropIndex, 0, moved);
      Store.saveWatchlist(list);
      App.renderWatchlist();
    });
  },
};
