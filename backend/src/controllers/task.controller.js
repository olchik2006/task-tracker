import {
  getAllTasks,
  addTask,
  toggleTaskStatus,
  removeTask
} from '../services/task.service.js'

export function getTasks(req, res) {
  res.json(getAllTasks())
}

export function createTask(req, res) {
  const { title } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' })
  }

  const created = addTask(title.trim())
  res.status(201).json(created)
}

export function toggleTask(req, res) {
  const updated = toggleTaskStatus(req.params.id)

  if (!updated) {
    return res.status(404).json({ message: 'Task not found' })
  }

  res.json(updated)
}

export function deleteTask(req, res) {
  const removed = removeTask(req.params.id)

  if (!removed) {
    return res.status(404).json({ message: 'Task not found' })
  }

  res.status(204).send()
}
