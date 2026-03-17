import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/task.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Task Tracker API is working'
  })
})

app.use('/api/tasks', taskRoutes)

export default app
