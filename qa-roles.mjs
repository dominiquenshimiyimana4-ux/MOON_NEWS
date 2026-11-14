// Reproduces the reported login problems across the four roles.
const BASE = process.env.QA_BASE ?? "http://localhost:3200";

const ACCOUNTS = {
  admin: { email: "nshimiyimanadominique4@gmail.com", password: "Dominique@2006" },
  author: { email: "authormoonnews@gmail.com", password: "Author01" },
  advertiser: { email: "advertisermoonnews@gmail.com", password: "advertiser02" },
  reader: { email: "reader@moonnews.rw", password: "reader123" },
};

export default async function run(page) {
  page.setDefaultTimeout(120000);
  const out = {};
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e).slice(0, 400)));

  for (const [role, creds] of Object.entries(ACCOUNTS)) {
    if (process.env.QA_ONLY && !process.env.QA_ONLY.split(",").includes(role)) continue;
    const before = consoleErrors.length;
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector("#email", { timeout: 120000 });
    // Wait until React has actually hydrated the login form (click handler attached).
    await page
      .waitForFunction(
        () => {
          const b = document.querySelector('form button[type="submit"]');
          if (!b) return false;
          const key = Object.keys(b).find((k) => k.startsWith("__reactProps"));
          return !!(key && b[key] && typeof b[key].onClick !== "undefined");
        },
        { timeout: 60000 }
      )
      .catch(() => {});
    await page.fill("#email", creds.email);
    await page.fill("#password", creds.password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForTimeout(8000);
    const body = await page.locator("body").innerText().catch(() => "");
    out[role] = {
      url: new URL(page.url()).pathname,
      card: (await page.locator(".card").first().innerText().catch(() => "")).slice(0, 200),
      hasUser: await page.evaluate(() => localStorage.getItem("moon_news_user")),
      denied: /access required|administrator only/i.test(body),
      newErrors: consoleErrors.slice(before),
    };
    await page.evaluate(() => localStorage.clear());
  }

  if (process.env.QA_ADMIN_VISIT) {
    consoleErrors.length = 0;
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 300000 });
    await page.waitForTimeout(8000);
    out.adminWithoutLogin = {
      url: new URL(page.url()).pathname,
      errors: [...consoleErrors],
    };
  }
  return out;
}
