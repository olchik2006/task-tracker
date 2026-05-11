import { getTasks, createTask, toggleTask, deleteTask } from "./api.js";
import { TaskForm } from "./components/TaskForm.js";
import { TaskList } from "./components/TaskList.js";
import { FilterBar } from "./components/FilterBar.js";
import { TaskStats } from "./components/TaskStats.js";
import posthog from "posthog-js";
import * as Sentry from "@sentry/browser";

posthog.init("phc_p7uvLQeEbizaSEBtdi4KB2vqYDS4vHm4sde3fLfMLw9x", {
  api_host: "https://task-tracker-rjpg.onrender.com/proxy/posthog",
});

let currentFilter = "all";
let tasks = [];
let showProductivityTip = false;
let featureFlagsSubscribed = false;

function addBreadcrumb(category, message, data = {}) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
}

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
    addBreadcrumb("tasks", "Loading tasks");
    tasks = await getTasks();
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "load_tasks" },
    });
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
    addBreadcrumb("feature_flags", "Feature flags updated");
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

function throwSentryTestError() {
  addBreadcrumb("ui.click", "User clicked Sentry test button");

  Sentry.withScope((scope) => {
    scope.setFingerprint([`alert-demo-${Date.now()}`]);
    const error = new Error("Sentry Test Error Alert Demo");
    Sentry.captureException(error);
  });

  const app = document.getElementById("app");
  const existing = document.getElementById("sentry-demo-error");

  if (!existing) {
    app.insertAdjacentHTML(
      "afterbegin",
      `
        <div id="sentry-demo-error" style="
          margin: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          background: #ffe5e5;
          color: #a40000;
          font-weight: 600;
        ">
          Test error was triggered and sent to Sentry.
        </div>
      `,
    );
  }
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
            <button id="sentry-test-btn" class="sentry-test-btn" type="button">
              Test Sentry Error
            </button>
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
    const sentryTestBtn = document.getElementById("sentry-test-btn");

    if (sentryTestBtn) {
      sentryTestBtn.addEventListener("click", () => {
        throwSentryTestError();
      });
    }

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = input.value.trim();
        if (!title) return;

        try {
          addBreadcrumb("tasks", "Creating task", {
            title_length: title.length,
          });

          await createTask(title);

          posthog.capture("task_created", {
            title_length: title.length,
            is_authenticated: false,
            category: "general",
          });

          await renderApp();
        } catch (error) {
          Sentry.captureException(error, {
            tags: { action: "task_created" },
            extra: { title },
          });
          console.error("Failed to create task:", error);
        }
      });
    }

    document.querySelectorAll(".toggle-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const taskBeforeToggle = tasks.find((task) => task.id === id);

        try {
          addBreadcrumb("tasks", "Toggling task", { task_id: id });

          await toggleTask(id);

          if (taskBeforeToggle && !taskBeforeToggle.done) {
            posthog.capture("task_completed", {
              task_id: id,
              title_length: taskBeforeToggle.title?.length || 0,
            });
          }

          await renderApp();
        } catch (error) {
          Sentry.captureException(error, {
            tags: { action: "task_completed" },
            extra: { task_id: id },
          });
          console.error("Failed to toggle task:", error);
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);

        try {
          addBreadcrumb("tasks", "Deleting task", { task_id: id });

          await deleteTask(id);

          posthog.capture("task_deleted", {
            task_id: id,
            reason: "manual_delete",
          });

          await renderApp();
        } catch (error) {
          Sentry.captureException(error, {
            tags: { action: "task_deleted" },
            extra: { task_id: id },
          });
          console.error("Failed to delete task:", error);
        }
      });
    });

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          currentFilter = button.dataset.filter;

          addBreadcrumb("tasks.filter", "Filter changed", {
            filter: currentFilter,
          });

          await renderApp();
        } catch (error) {
          Sentry.captureException(error, {
            tags: { action: "change_filter" },
            extra: { filter: button.dataset.filter },
          });
          console.error("Failed to change filter:", error);
        }
      });
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "render_app" },
    });
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
