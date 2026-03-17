import { tasks } from '../data/tasks.js'

export function getAllTasks() {
  return tasks
}

export function addTask(title) {
  const newTask = {
    id: Date.now(),
    title,
    done: false
  }

  tasks.push(newTask)
  return newTask
}

export function toggleTaskStatus(id) {
  const task = tasks.find((t) => t.id === Number(id))

  if (!task) return null

  task.done = !task.done
  return task
}

export function removeTask(id) {
  const index = tasks.findIndex((t) => t.id === Number(id))

  if (index === -1) return false

  tasks.splice(index, 1)
  return true
}
