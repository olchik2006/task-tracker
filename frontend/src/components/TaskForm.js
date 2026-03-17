export function TaskForm(onCreate) {
  return `
    <form id="task-form" class="task-form">
      <input id="task-input" type="text" placeholder="Введи нову задачу" />
      <button type="submit">Додати</button>
    </form>
  `
}
