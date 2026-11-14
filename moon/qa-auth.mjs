export default async function run(page) {
  const result = {};
  page.setDefaultTimeout(20000);
  const go = async (path) => {
    // `commit` returns as soon as the response arrives; the form only needs the
    // React bundle, which we wait for explicitly below.
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "commit", timeout: 20000 });
    await page.locator("form").first().waitFor({ state: "attached", timeout: 20000 });
    await page.waitForTimeout(800);
  };
  const submit = () => page.locator('form.space-y-4 button[type="submit"]').click();

  // 1. Login page must not leak any admin credential.
  await go("/login");
  const loginHtml = await page.content();
  result.loginLeaksAdminEmail = loginHtml.includes("dominiquenshimiyimana4@gmail.com");
  result.loginLeaksAdminPassword = loginHtml.includes("Dominique@2006");
  result.loginStillHasAdvertiserDemo = loginHtml.includes("ads@bk.rw");

  // 2. Register form must refuse the admin address.
  await go("/register");
  await page.fill("#name", "Intruder");
  await page.fill("#email", "dominiquenshimiyimana4@gmail.com");
  await page.fill("#password", "Whatever@12345");
  await page.fill("#confirm", "Whatever@12345");
  await submit();
  await page.waitForTimeout(1000);
  const bodyAfterRegister = await page.locator("body").innerText();
  result.registerBlocked = /cannot be registered|ntishobora kwiyandikisha/i.test(bodyAfterRegister);
  result.registeredAccountCreated = await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem("moon_news_credentials") ?? "[]");
    return v.some((c) => c.email === "intruder" && c.email === "dominiquenshimiyimana4@gmail.com");
  });
  result.stayedOnRegister = page.url().includes("/register");

  return result;
}
