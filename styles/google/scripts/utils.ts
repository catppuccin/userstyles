// deno-lint-ignore-file no-window
/**
 * Code is derived from
 * https://github.com/bytedance/UI-TARS-desktop/tree/main/packages/agent-infra/search/browser-search
 *
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Page, Route } from "playwright";

/**
 * Applies various stealth techniques to make the browser appear more like a regular user browser
 * @param page - Puppeteer page object
 */
export async function applyStealthScripts(page: Page) {
  // No need to bypass CSP, user agent
  // await page.setBypassCSP(true);
  // await page.setUserAgent(
  //   `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36`,
  // );

  /**
   * https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html
   */
  await page.addInitScript(() => {
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
        } as PermissionStatus)
        : originalQuery(parameters);
  });
}

/**
 * Sets up request interception to block unnecessary resources and apply stealth techniques
 * @param page - Playwright page object
 */
export async function interceptRequest(page: Page) {
  await applyStealthScripts(page);

  await page.route("**/*", (route: Route) => {
    const request = route.request();
    // Why is this not upstream typed?
    const resourceType = request.resourceType() as
      | "document"
      | "stylesheet"
      | "image"
      | "media"
      | "font"
      | "script"
      | "texttrack"
      | "xhr"
      | "fetch"
      | "eventsource"
      | "websocket"
      | "manifest"
      | "other";

    if (
      resourceType !== "document" && resourceType !== "stylesheet" &&
      resourceType !== "script"
    ) {
      return route.abort();
    }
    return route.continue();
  });
}
