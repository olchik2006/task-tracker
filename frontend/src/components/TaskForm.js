export function TaskForm(showUrgentFilter) {
  return `
    <form id="task-form" class="task-form">
      <input id="task-input" type="text" placeholder="Введи нову задачу">

      abel class="urgent-toggle">
        <input id="task-urgent" type="checkbox">
        <span>Urgent</span>
      </label>

      <button type="submit">Додати</button>
    </form>
  `;
}
