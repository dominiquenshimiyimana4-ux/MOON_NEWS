// End-to-end check of the admin "Visitors" box.
//
//  Read this page-time budget: the dev server compiles slowly, so the visitors
//  are opened concurrently with the admin login and images are blocked (their
//  upstream is timing out and has nothing to do with the box).
//
// Run: node <skill>/browser.mjs http://localhost:3000/login --script ./qa-visitors2.mjs
const BASE = "http://localhost:3000";
const ADMIN_EMAIL = "nshimiyimanadominique4@gmail.com";
const ADMIN_PASSWORD = "Dominique@2006";

export default async function run(page, ui) {
  const out = {};
  const browser = page.context().browser();
  const blockImages = (p) => p.route(/picsum\.photos|pravatar|\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i, (r) => r.abort());

  async function reader(path) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await blockImages(p);
    const track = [];
    p.on("response", (r) => {
      if (r.url().includes("/api/analytics/visit")) track.push(r.status());
    });
    await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForTimeout(2500);
    return { ctx, p, track };
  }

  // Two readers land on different pages while the admin logs in.
  const readerTask = (async () => {
    const a = await reader("/");
    const href = await a.p.evaluate(() => document.querySelector("a[href*='/news/']")?.getAttribute("href") ?? null);
    if (href) {
      await a.p.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 120000 });
      await a.p.waitForTimeout(2000);
    }
    const b = await reader("/latest");
    return { a, b, href };
  })();

  await page.waitForSelector("#email", { timeout: 90000 });
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", ADMIN_PASSWORD);
  await page.click('form button[type="submit"]');
  const loggedIn = await page
    .waitForURL((u) => !u.pathname.includes("/login"), { timeout: 60000 })
    .then(() => true)
    .catch(() => false);
  out.loggedIn = loggedIn;

  const { a, b, href } = await readerTask;

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector('section[aria-label="Live visitors"]', { timeout: 60000 }).catch(() => { });
  await page.waitForTimeout(6000);

  const api = await page.evaluate(async () => {
    const tok = localStorage.getItem("moon_news_token");
    const r = await fetch("/api/admin/analytics/online", {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    });
    return { status: r.status, body: r.ok ? await r.json() : null };
  });

  const box = page.locator('section[aria-label="Live visitors"]');
  out.api = {
    status: api.status,
    onlineNow: api.body?.onlineNow,
    visitorsToday: api.body?.visitorsToday,
    recent: api.body?.recent?.map((v) => v.page),
  };
  out.rows = await box.locator("ul li").count();
  out.boxText = await box.innerText().catch(() => "(box not found)");
  out.hasReaderArticle = Boolean(href && out.boxText.includes("Rwanda Launches"));
  out.hasLatest = out.boxText.includes("Latest");
  out.hasStaffRows = /(^|\n)\s*Admin\s*\n/.test(out.boxText);

  await box.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await box.screenshot({ path: "qa-visitors2.png" });

  await a.ctx.close();
  await b.ctx.close();
  return out;
}
