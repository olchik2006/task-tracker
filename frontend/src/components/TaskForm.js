export function TaskForm(showUrgentFeature) {
  return `
    <form id="task-form" class="task-form">
      <input
        id="task-input"
        type="text"
        placeholder="Введи нову задачу"
      />

      ${
        showUrgentFeature
          ? `
            <label class="urgent-toggle" for="task-urgent">
              <input id="task-urgent" type="checkbox" />
              <span>Urgent</span>
            </label>
          `
          : ""
      }

      <button type="submit">Додати</button>
    </form>
  `;
}
