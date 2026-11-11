// Verifies the three provisioned accounts land on their own dashboards.
//
// Credentials are read from the environment so no password is committed:
//   QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD
//   QA_AUTHOR_EMAIL / QA_AUTHOR_PASSWORD
//   QA_ADVERTISER_EMAIL / QA_ADVERTISER_PASSWORD
// Any account whose e-mail or password is missing is skipped.
export default async function run(page) {
  const result = {};
  page.setDefaultTimeout(25000);

  async function login(email, password) {
    await page.goto("http://localhost:3000/login", { waitUntil: "commit", timeout: 25000 });
    await page.locator("form").first().waitFor({ state: "attached", timeout: 25000 });
    await page.waitForTimeout(800);
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.locator('form.space-y-4 button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 25000 }).catch(() => { });
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText().catch(() => "");
    return {
      url: new URL(page.url()).pathname,
      denied: /access required|not authorized|administrator only/i.test(body),
      sample: body.split("\n").filter(Boolean).slice(0, 6),
    };
  }

  async function check(role) {
    const prefix = `QA_${role.toUpperCase()}`;
    const email = process.env[`${prefix}_EMAIL`];
    const password = process.env[`${prefix}_PASSWORD`];
    if (!email || !password) {
      return { skipped: true, reason: `${prefix}_EMAIL / ${prefix}_PASSWORD not set` };
    }
    return login(email, password);
  }

  result.admin = await check("admin");
  result.author = await check("author");
  result.advertiser = await check("advertiser");

  await page.evaluate(() => localStorage.clear());
  return result;
}
