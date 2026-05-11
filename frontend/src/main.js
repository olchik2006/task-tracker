import "./styles/main.css";
import * as Sentry from "@sentry/browser";
import { renderApp } from "./App.js";
import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST;

if (key && host) {
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    autocapture: true,
  });
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
});

Sentry.setUser({
  id: "guest-task-tracker",
  email: "guest@tasktracker.local",
  segment: "lab6-demo",
});

renderApp();
