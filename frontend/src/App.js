import { getTasks, createTask, toggleTask, deleteTask } from "./api.js";
import { TaskForm } from "./components/TaskForm.js";
import { TaskList } from "./components/TaskList.js";
import { FilterBar } from "./components/FilterBar.js";
import { TaskStats } from "./components/TaskStats.js";
import posthog from "posthog-js";

let currentFilter = "all";
let tasks = [];
let showUrgentFeature = false;
let flagRefreshTimer = null;
let featureFlagsSubscribed = false;

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  if (currentFilter === "urgent") {
    return tasks.filter((task) => task.urgent);
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
  const nextValue = !!posthog.isFeatureEnabled("show-urgent-filter", {
    send_event: false,
  });

  const changed = nextValue !== showUrgentFeature;
  showUrgentFeature = nextValue;

  if (!showUrgentFeature && currentFilter === "urgent") {
    currentFilter = "all";
  }

  return changed;
}

function startFlagPolling() {
  if (flagRefreshTimer) {
    clearInterval(flagRefreshTimer);
  }

  flagRefreshTimer = setInterval(async () => {
    try {
      await posthog.reloadFeatureFlags();
    } catch (error) {
      console.error("Failed to reload feature flags:", error);
    }
  }, 10000);
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
    startFlagPolling();

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
          ${TaskForm(showUrgentFeature)}
          ${FilterBar(currentFilter, showUrgentFeature)}
          ${TaskList(getFilteredTasks())}
        </div>
      </main>
    `;

    const form = document.getElementById("task-form");
    const input = document.getElementById("task-input");
    const urgentInput = document.getElementById("task-urgent");

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = input.value.trim();
        if (!title) return;

        const urgent =
          showUrgentFeature && urgentInput ? urgentInput.checked : false;

        await createTask(title, urgent);

        posthog.capture("task_created", {
          title_length: title.length,
          is_authenticated: false,
          category: "general",
          priority: urgent ? "high" : "normal",
          urgent,
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
            urgent: !!taskBeforeToggle.urgent,
          });
        }

        await renderApp();
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const taskToDelete = tasks.find((task) => task.id === id);

        await deleteTask(id);

        posthog.capture("task_deleted", {
          task_id: id,
          reason: "manual_delete",
          urgent: !!taskToDelete?.urgent,
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
