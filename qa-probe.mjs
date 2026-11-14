export default async function run(page, ui) {
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.waitForSelector("#email", { timeout: 60000 });
  await page.fill("#email", "reader@moonnews.rw");
  await page.fill("#password", "reader123");
  await page.locator('form button[type="submit"].w-full').click();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const s = await page.evaluate(() => !!localStorage.getItem("moon_news_user"));
    if (s) break;
  }
  return {
    url: page.url(),
    pageErrors: errs.slice(0, 5),
    stored: await page.evaluate(() => localStorage.getItem("moon_news_user")),
    vaultLen: await page.evaluate(
      () => JSON.parse(localStorage.getItem("moon_news_credentials") || "[]").length
    ),
    keys: await page.evaluate(() => Object.keys(localStorage)),
    allText: await page.evaluate(() => {
      const card = document.querySelector(".card");
      return card ? card.innerText : document.body.innerText.slice(-800);
    }),
  };
}
