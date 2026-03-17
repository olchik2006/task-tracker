import { Router } from 'express'
import {
  getTasks,
  createTask,
  toggleTask,
  deleteTask
} from '../controllers/task.controller.js'

const router = Router()

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/toggle', toggleTask)
router.delete('/:id', deleteTask)

export default router
