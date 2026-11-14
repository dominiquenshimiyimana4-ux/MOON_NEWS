export default async function run(page) {
  const button = (name) => page.getByRole('button', { name, exact: true });
  await button('2').click();
  await button('+').click();
  await button('3').click();
  await button('Calculate').click();
  const addition = await page.locator('[aria-live="polite"]').innerText();
  await button('Clear calculator').click();
  await button('8').click();
  await button('÷').click();
  await button('0').click();
  await button('Calculate').click();
  const error = await page.locator('[aria-live="assertive"]').innerText();
  return { addition, error };
}

