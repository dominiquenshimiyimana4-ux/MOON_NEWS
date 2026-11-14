// Verifies the admin "Visitors" box records real visits.
//
// 1. Two different visitors browse the public site (separate browser contexts,
//    so they get different visitor tokens).
// 2. The admin logs in and opens the dashboard.
// 3. The box must show the visitors, with the page they are viewing.
//
// Run: node <skill>/browser.mjs http://localhost:3000/login --script ./qa-visitors.mjs
const BASE = "http://localhost:3000";

export default async function run(page, ui) {
  const result = {};
  const browser = page.context().browser();

  // --- visitor 1: lands on the home page, then opens an article ---------------
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await a.goto(`${BASE}/`);
  await a.waitForTimeout(800);
  const articleHref = await a.evaluate(() => {
    const link = document.querySelector('a[href*="/news/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (articleHref) {
    await a.goto(`${BASE}${articleHref}`);
    await a.waitForTimeout(800);
  }
  result.visitor1Page = articleHref ?? "/";

  // --- visitor 2: different context -> different visitor token ---------------
  const ctxB = await browser.newContext();
  const b = await ctxB.newPage();
  await b.goto(`${BASE}/latest`);
  await b.waitForTimeout(800);
  result.visitor2Page = "/latest";

  const apiStatus = await page.evaluate(async () => {
    const r = await fetch("/api/admin/analytics/online");
    return r.status;
  });
  result.unauthenticatedApiStatus = apiStatus;

  // --- admin logs in ----------------------------------------------------------
  const email = process.env.QA_ADMIN_EMAIL;
  const password = process.env.QA_ADMIN_PASSWORD;
  if (!email || !password) return { ...result, error: "QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD not set" };

  await page.goto(`${BASE}/login`);
  await page.locator("#email").waitFor({ state: "attached", timeout: 25000 });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.locator('form.space-y-4 button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 25000 }).catch(() => { });
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(3000);

  result.boxText = await page
    .locator('section[aria-label="Live visitors"]')
    .innerText()
    .catch(() => "(visitor box not found)");
  result.rows = await page.locator('section[aria-label="Live visitors"] ul li').count();
  result.hasArticlePage = result.boxText.includes("Technology") || result.boxText.includes("News");

  const api = await page.evaluate(async () => {
    const r = await fetch("/api/admin/analytics/online");
    return { status: r.status, body: r.ok ? await r.json() : null };
  });
  result.api = { status: api.status, onlineNow: api.body?.onlineNow, visitorsToday: api.body?.visitorsToday, recent: api.body?.recent?.length };

  await ctxA.close();
  await ctxB.close();
  return result;
}


