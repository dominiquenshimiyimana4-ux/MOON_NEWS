// Test the login step
import loginStep from './moon/qa-step-login.mjs';

const BASE = process.env.QA_BASE ?? "http://localhost:3200";

export default async function run(page) {
  page.setDefaultTimeout(60000);

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e).slice(0, 400)));

  console.log("Navigating to login page...");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });

  console.log("Running login step...");
  const result = await loginStep(page);

  console.log("Login step result:", JSON.stringify(result, null, 2));

  // Take a screenshot after login
  await page.screenshot({ path: "qa-login-test.png", fullPage: true });

  return {
    loginResult: result,
    consoleErrors,
    finalUrl: page.url()
  };
}
