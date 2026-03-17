export function TaskItem(task) {
  return `
    <li class="task ${task.done ? 'done' : ''}">
      <span>${task.title}</span>
      <div class="task-actions">
        <button class="toggle-btn" data-id="${task.id}">
          ${task.done ? 'Повернути' : 'Виконано'}
        </button>
        <button class="delete-btn" data-id="${task.id}">Видалити</button>
      </div>
    </li>
  `
}
