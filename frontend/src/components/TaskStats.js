export function TaskStats(tasks) {
  const total = tasks.length
  const done = tasks.filter((task) => task.done).length
  const active = total - done

  return `
    <div class="task-stats">
      <div class="stat-card">
        <span class="stat-label">Всього</span>
        <strong class="stat-value">${total}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">Активні</span>
        <strong class="stat-value">${active}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-label">Виконані</span>
        <strong class="stat-value">${done}</strong>
      </div>
    </div>
  `
}
