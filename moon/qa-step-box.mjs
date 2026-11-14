export default async function run(page) {
  console.log("STEP start " + page.url());
  const api = await page.evaluate(async () => {
    const tok = localStorage.getItem("moon_news_token");
    const r = await fetch("/api/admin/analytics/online", {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    });
    return { status: r.status, body: r.ok ? await r.json() : null };
  });
  console.log("STEP api " + api.status);
  await page.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded" });
  console.log("STEP admin navigated");
  await page.waitForSelector('section[aria-label="Live visitors"]', { timeout: 60000 }).catch(() => { });
  console.log("STEP box found");
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "qa-box.png", fullPage: false });
  const box = await page
    .locator('section[aria-label="Live visitors"]')
    .innerText()
    .catch(() => "(box not found)");
  return {
    api: { status: api.status, onlineNow: api.body?.onlineNow, visitorsToday: api.body?.visitorsToday, recent: api.body?.recent?.map((v) => v.page) },
    rows: await page.locator('section[aria-label="Live visitors"] ul li').count(),
    box,
  };
}
