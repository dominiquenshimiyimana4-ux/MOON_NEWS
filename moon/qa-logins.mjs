// Verifies the three provisioned accounts land on their own dashboards.
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

  result.admin = await login("nshimiyimanadominique4@gmail.com", "Dominique@2006");
  result.author = await login("Authormoonnews@gmail.com", "Author01");
  result.advertiser = await login("advertisermoonnews@gmail.com", "advertiser02");

  await page.evaluate(() => localStorage.clear());
  return result;
}
