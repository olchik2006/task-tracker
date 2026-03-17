const API_URL = 'http://localhost:5000/api/tasks'

export async function getTasks() {
  const response = await fetch(API_URL)
  return await response.json()
}

export async function createTask(title) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  })

  return await response.json()
}

export async function toggleTask(id) {
  const response = await fetch(`${API_URL}/${id}/toggle`, {
    method: 'PATCH'
  })

  return await response.json()
}

export async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
}
