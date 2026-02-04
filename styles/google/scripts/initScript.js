// deno-lint-ignore-file
/**
 * Override the navigator.webdriver property
 * The webdriver read-only property of the navigator interface indicates whether the user agent is controlled by automation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver
 */
Object.defineProperty(navigator, "webdriver", {
  get: () => undefined,
});

// Mock languages and plugins to mimic a real browser
Object.defineProperty(navigator, "languages", {
  get: () => ["en-US", "en"],
});

Object.defineProperty(navigator, "plugins", {
  get: () => [{}, {}, {}, {}, {}],
});

// Redefine the headless property
Object.defineProperty(navigator, "headless", {
  get: () => false,
});

// Override the permissions API
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) =>
  parameters.name === "notifications"
    ? Promise.resolve({
      state: Notification.permission,
    })
    : originalQuery(parameters);