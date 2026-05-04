import { getTasks, createTask, toggleTask, deleteTask } from "./api.js";
import { TaskForm } from "./components/TaskForm.js";
import { TaskList } from "./components/TaskList.js";
import { FilterBar } from "./components/FilterBar.js";
import { TaskStats } from "./components/TaskStats.js";
import posthog from "posthog-js";

let currentFilter = "all";
let tasks = [];
let showUrgentFilter = false;

posthog.onFeatureFlags(() => {
  showUrgentFilter = !!posthog.isFeatureEnabled("show-urgent-filter");
  renderApp();
});

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  if (currentFilter === "urgent") {
    return tasks.filter((task) => task.title?.toLowerCase().includes("urgent"));
  }

  return tasks;
}

async function loadTasks() {
  tasks = await getTasks();
}

export async function renderApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <main>
      <div class="container">
        <div class="header">
          <h1>Task Tracker</h1>
          <p class="subtitle">Loading...</p>
        </div>
      </div>
    </main>
  `;

  try {
    await loadTasks();
    showUrgentFilter = !!posthog.isFeatureEnabled("show-urgent-filter");

    app.innerHTML = `
      <main>
        <div class="container">
          <div class="header">
            <span class="badge">Task Manager</span>
            <span class="env-badge">Mode: ${import.meta.env.VITE_APP_STATUS || "Development"}</span>
            <h1>Task Tracker</h1>
            <p class="subtitle">Організовуй свої задачі швидко, просто і красиво</p>
          </div>

          ${TaskStats(tasks)}
          ${TaskForm()}
          ${FilterBar(currentFilter, showUrgentFilter)}
          ${TaskList(getFilteredTasks())}
        </div>
      </main>
    `;

    const form = document.getElementById("task-form");
    const input = document.getElementById("task-input");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = input.value.trim();
      if (!title) return;

      await createTask(title);

      posthog.capture("task_created", {
        title_length: title.length,
        is_authenticated: false,
        category: "general",
        priority: title.toLowerCase().includes("urgent") ? "high" : "normal",
      });

      await renderApp();
    });

    document.querySelectorAll(".toggle-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const taskBeforeToggle = tasks.find((task) => task.id === id);

        await toggleTask(id);

        if (taskBeforeToggle && !taskBeforeToggle.done) {
          posthog.capture("task_completed", {
            task_id: id,
            title_length: taskBeforeToggle.title?.length || 0,
          });
        }

        await renderApp();
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);

        await deleteTask(id);

        posthog.capture("task_deleted", {
          task_id: id,
          reason: "manual_delete",
        });

        await renderApp();
      });
    });

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        currentFilter = button.dataset.filter;
        await renderApp();
      });
    });
  } catch (error) {
    console.error(error);

    app.innerHTML = `
      <main>
        <div class="container">
          <h1>Task Tracker</h1>
          <p class="subtitle">Сталася помилка при завантаженні застосунку</p>
        </div>
      </main>
    `;
  }
}
