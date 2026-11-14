export default async function run(page) {
  await page.setViewportSize?.({ width: 1280, height: 1100 }).catch(() => { });
  const box = page.locator('section[aria-label="Live visitors"]');
  await box.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await box.screenshot({ path: "qa-box-only.png" });
  await page.screenshot({ path: "qa-box-wide.png" });
  return { boxTop: (await box.boundingBox()) ?? null };
}
