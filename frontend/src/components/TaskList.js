import { TaskItem } from "./TaskItem";

export function TaskList(tasks) {
  if (!tasks.length) {
    return `<p class="empty">Список задач порожній</p>`;
  }

  return `
    <ul class="task-list">
      ${tasks
        .map(
          (task) => `
            <li class="task ${task.done ? "done" : ""}">
              <div class="task-content">
                <span>${task.title}</span>
                ${
                  task.urgent
                    ? `<span class="task-badge urgent-badge">Urgent</span>`
                    : ""
                }
              </div>

              <div class="task-actions">
                <button class="toggle-btn" data-id="${task.id}">
                  ${task.done ? "Повернути" : "Виконано"}
                </button>
                <button class="delete-btn" data-id="${task.id}">
                  Видалити
                </button>
              </div>
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}
