// Responsive QA: loads key pages at phone width and reports horizontal
// overflow plus any Next.js dev-overlay issues.
// Run: node ../.codegpt/browser-automation/browser.mjs http://localhost:3000 --script ./qa-pages.mjs
export default async function run(page, _ui) {
  const results = [];
  const pages = ["/", "/register", "/login", "/latest"];
  await page.setViewportSize({ width: 375, height: 812 });

  for (const path of pages) {
    await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      let issueText = "";
      for (const portal of Array.from(document.querySelectorAll("nextjs-portal"))) {
        const root = portal.shadowRoot;
        if (!root) continue;
        const badge = root.querySelector("[data-issues-open]");
        if (badge) issueText += badge.textContent + " ";
      }
      return {
        url: location.pathname,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        devIssues: issueText.trim() || "none",
      };
    });
    await page.screenshot({ path: `qa-${path.replace(/\//g, "") || "home"}-phone.png` });
    results.push(m);
  }
  return results;
}
