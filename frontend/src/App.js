import { getTasks, createTask, toggleTask, deleteTask } from './api.js'
import { TaskForm } from './components/TaskForm.js'
import { TaskList } from './components/TaskList.js'
import { FilterBar } from './components/FilterBar.js'

let currentFilter = 'all'
let tasks = []

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.done)
  }

  if (currentFilter === 'done') {
    return tasks.filter((task) => task.done)
  }

  return tasks
}

async function loadTasks() {
  tasks = await getTasks()
}

export async function renderApp() {
  const app = document.getElementById('app')

  await loadTasks()

  app.innerHTML = `
    <div class="container">
      <div class="header">
        <span class="badge">Task Manager</span>
        <h1>Task Tracker</h1>
        <p class="subtitle">Організовуй свої задачі швидко, просто і красиво</p>
      </div>

      ${TaskForm()}
      ${FilterBar(currentFilter)}
      ${TaskList(getFilteredTasks())}
    </div>
  `

  const form = document.getElementById('task-form')
  const input = document.getElementById('task-input')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const title = input.value.trim()
    if (!title) return

    await createTask(title)
    await renderApp()
  })

  document.querySelectorAll('.toggle-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      await toggleTask(Number(button.dataset.id))
      await renderApp()
    })
  })

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      await deleteTask(Number(button.dataset.id))
      await renderApp()
    })
  })

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      currentFilter = button.dataset.filter
      await renderApp()
    })
  })
}
