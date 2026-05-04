import { TaskItem } from './TaskItem'

export function TaskList(tasks) {
  if (!tasks.length) {
    return `<p class="empty">Список задач порожній</p>`
  }

  return `
    <ul class="task-list">
      ${tasks.map((task) => TaskItem(task)).join('')}
    </ul>
  `
}
