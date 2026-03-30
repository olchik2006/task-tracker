export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter(t => !t.done);
  if (filter === 'done') return tasks.filter(t => t.done);
  return tasks;
}

export function countTasks(tasks) {
  return {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    active: tasks.filter(t => !t.done).length
  };
}

export function sortTasksById(tasks) {
  return [...tasks].sort((a, b) => a.id - b.id);
}