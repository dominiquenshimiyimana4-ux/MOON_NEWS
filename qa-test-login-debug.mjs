// Debug the login step
import loginStep from './moon/qa-step-login.mjs';

const BASE = process.env.QA_BASE ?? "http://localhost:3200";

export default async function run(page) {
  page.setDefaultTimeout(60000);

  const consoleErrors = [];
  const consoleLogs = [];
  page.on("console", (m) => {
    const text = m.text().slice(0, 300);
    if (m.type() === "error") consoleErrors.push(text);
    consoleLogs.push(`[${m.type()}] ${text}`);
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e).slice(0, 400)));

  console.log("Navigating to login page...");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Check if backend is reachable
  const initialState = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    hasForm: !!document.querySelector('form'),
    hasEmailField: !!document.querySelector('#email'),
    hasPasswordField: !!document.querySelector('#password'),
    hasSubmitButton: !!document.querySelector('form button[type="submit"]')
  }));

  console.log("Initial state:", JSON.stringify(initialState, null, 2));

  console.log("Running login step...");
  const result = await loginStep(page);

  console.log("Login step result:", JSON.stringify(result, null, 2));

  // Check for error messages on the page
  const errorInfo = await page.evaluate(() => {
    const errorElements = Array.from(document.querySelectorAll('[role="alert"], .error, .text-red-500, .text-red-600'));
    return {
      errors: errorElements.map(el => el.textContent.trim()),
      bodyText: document.body.innerText.slice(0, 500)
    };
  });

  // Take a screenshot after login
  await page.screenshot({ path: "qa-login-test-debug.png", fullPage: true });

  return {
    initialState,
    loginResult: result,
    errorInfo,
    consoleErrors,
    consoleLogs: consoleLogs.slice(-20),
    finalUrl: page.url()
  };
}
