export function FilterBar(currentFilter, showUrgentFilter) {
  return `
    <div class="filters">
      <button class="filter-btn ${currentFilter === "all" ? "active" : ""}" data-filter="all">All</button>
      <button class="filter-btn ${currentFilter === "active" ? "active" : ""}" data-filter="active">Active</button>
      <button class="filter-btn ${currentFilter === "done" ? "active" : ""}" data-filter="done">Done</button>
      ${
        showUrgentFilter
          ? `<button class="filter-btn ${currentFilter === "urgent" ? "active" : ""}" data-filter="urgent">Only Urgent</button>`
          : ""
      }
    </div>
  `;
}
