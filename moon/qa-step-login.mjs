export default async function run(page) {
  console.log("STEP begin");
  await page.waitForSelector("#email", { timeout: 20000 });
  console.log("STEP fields");
  await page.fill("#email", "nshimiyimanadominique4@gmail.com");
  await page.fill("#password", "Dominique@2006");
  await page.click('form button[type="submit"]');
  console.log("STEP submitted");
  const ok = await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 }).then(() => true).catch(() => false);
  const store = await page.evaluate(() => {
    const tok = localStorage.getItem("moon_news_token");
    let payload = null;
    try {
      payload = tok ? JSON.parse(atob(tok.split(".")[1])) : null;
    } catch { }
    return { hasToken: Boolean(tok), payload, body: document.body.innerText.slice(0, 300) };
  });
  return { ok, url: page.url(), store };
}
