import { getTasks, createTask, toggleTask, deleteTask } from "./api.js";
import { TaskForm } from "./components/TaskForm.js";
import { TaskList } from "./components/TaskList.js";
import { FilterBar } from "./components/FilterBar.js";
import { TaskStats } from "./components/TaskStats.js";
import posthog from "posthog-js";

posthog.init("phc_p7uvLQeEbizaSEBtdi4KB2vqYDS4vHm4sde3fLfMLw9x", {
  api_host: "https://task-tracker-rjpg.onrender.com/proxy/posthog",
});

let currentFilter = "all";
let tasks = [];
let showProductivityTip = false;
let featureFlagsSubscribed = false;

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

async function loadTasks() {
  try {
    tasks = await getTasks();
  } catch (error) {
    console.error("Failed to load tasks:", error);
    tasks = [];
  }
}

function syncFeatureFlags() {
  const nextValue = !!posthog.isFeatureEnabled("show-productivity-tip");
  const changed = nextValue !== showProductivityTip;
  showProductivityTip = nextValue;
  return changed;
}

function setupFeatureFlagListener() {
  if (featureFlagsSubscribed) return;
  featureFlagsSubscribed = true;

  posthog.onFeatureFlags(() => {
    const changed = syncFeatureFlags();
    if (changed) {
      renderApp();
    }
  });
}

function ProductivityTip() {
  return `
    <section class="tip-card">
      <div class="tip-icon">✨</div>
      <div class="tip-content">
        <h3 class="tip-title">Порада продуктивності</h3>
        <p class="tip-text">
          Використовуй фільтри та регулярно відмічай виконані задачі, щоб краще відстежувати свій прогрес.
        </p>
      </div>
    </section>
  `;
}

export async function renderApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <main>
      <div class="container">
        <div class="header">
          <span class="badge">Task Manager</span>
          <span class="env-badge">Mode: ${import.meta.env.VITE_APP_STATUS || "Development"}</span>
          <h1>Task Tracker</h1>
          <p class="subtitle">Організовуй свої задачі швидко, просто і красиво</p>
        </div>
        <p class="empty">Loading...</p>
      </div>
    </main>
  `;

  try {
    await loadTasks();
    setupFeatureFlagListener();
    await posthog.reloadFeatureFlags();
    syncFeatureFlags();

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
          ${showProductivityTip ? ProductivityTip() : ""}
          ${TaskForm()}
          ${FilterBar(currentFilter)}
          ${TaskList(getFilteredTasks())}
        </div>
      </main>
    `;

    const form = document.getElementById("task-form");
    const input = document.getElementById("task-input");

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = input.value.trim();
        if (!title) return;

        await createTask(title);

        posthog.capture("task_created", {
          title_length: title.length,
          is_authenticated: false,
          category: "general",
        });

        await renderApp();
      });
    }

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
          <div class="header">
            <h1>Task Tracker</h1>
            <p class="subtitle">Сталася помилка при завантаженні застосунку</p>
          </div>
        </div>
      </main>
    `;
  }
}
