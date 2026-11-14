// End-to-end check of the "reader asks to go live → admin approves" flow.
export default async function run(page, ui) {
  const base = process.env.QA_BASE ?? "http://localhost:3000";
  const out = {};

  const signIn = async (email, password) => {
    await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#email", { timeout: 60000 });
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.locator('form button[type="submit"].w-full').click();
    // Wait until the auth store has persisted the user (login runs a 300ms
    // simulated request plus hashing) and the app has routed away.
    await page.waitForFunction(
      () => !!localStorage.getItem("moon_news_user"),
      null,
      { timeout: 30000 }
    );
    await page.waitForTimeout(800);
    return {
      role: await page.evaluate(() => JSON.parse(localStorage.getItem("moon_news_user"))?.role),
      url: page.url(),
    };
  };

  // Start from a clean demo state so the run is repeatable.
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("moon_news_live_requests");
    localStorage.removeItem("moon_news_staff_notifications");
  });

  // 1. Reader signs in.
  out.readerLogin = await signIn("reader@moonnews.rw", "reader123");

  // 2. Reader opens the Live page and requests to go live.
  await page.goto(`${base}/live`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Want to go live?", { timeout: 60000 });
  await page.waitForTimeout(800);
  out.liveSnap = await ui.snapshot();

  const requestBtn = page.getByRole("button", { name: /Request to go live/i });
  if (await requestBtn.count()) {
    await requestBtn.first().click();
    await page.waitForTimeout(400);
    await page.locator("#live-title").fill("QA Test Broadcast");
    await page.locator("#live-desc").fill("Approved stream used to verify the flow.");
    await page.locator("#live-url").fill("https://www.w3schools.com/html/mov_bbb.mp4");
    await page.getByRole("button", { name: /Submit request/i }).click();
    await page.waitForTimeout(600);
  }
  out.afterRequest = await ui.snapshot();
  out.storedRequests = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moon_news_live_requests") || "[]").map((r) => ({
      title: r.title,
      status: r.status,
      user: r.userName,
    }))
  );
  out.staffNotifs = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moon_news_staff_notifications") || "[]").map((n) => ({
      id: n.id,
      title: n.title.en,
    }))
  );

  // 3. Admin signs in and reviews the queue.
  await page.evaluate(() => localStorage.removeItem("moon_news_user"));
  out.adminLogin = await signIn("dominiquenshimiyimana4@gmail.com", "Dominique@2006");
  await page.goto(`${base}/admin/live-requests`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Live Requests", { timeout: 60000 });
  await page.waitForTimeout(800);
  out.adminQueue = await ui.snapshot();
  out.sidebarBadge = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("aside a"));
    const l = links.find((a) => a.getAttribute("href") === "/admin/live-requests");
    return l ? l.textContent.trim() : null;
  });

  const approve = page.getByRole("button", { name: /^Approve$/ });
  out.approveVisible = await approve.count();
  if (await approve.count()) {
    await approve.first().click();
    await page.waitForTimeout(600);
  }
  out.approvedRows = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moon_news_live_requests") || "[]").map((r) => ({
      title: r.title,
      status: r.status,
      by: r.reviewedBy,
    }))
  );
  out.staffNotifsAfter = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("moon_news_staff_notifications") || "[]").map((n) => n.id)
  );

  // 4. The approved stream should now be on the public Live page.
  await page.goto(`${base}/live`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Want to go live?", { timeout: 60000 });
  await page.waitForTimeout(1500);
  out.liveAfterApproval = await ui.snapshot();
  out.videoSrc = await page.evaluate(() => document.querySelector("video")?.getAttribute("src") ?? null);
  out.bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1200));
  await page.screenshot({ path: "qa-live.png", fullPage: false });
  return out;
}
