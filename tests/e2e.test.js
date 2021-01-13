const PORT = process.env['PORT'] || 8383;

describe('index', () => {
  const url = `http://localhost:${PORT}/holidays.html`;

  it('普通の日', async () => {
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('#lead-text');
    await expect(page).toMatch(/次の連休は \d+ 日後です/);
  });

  it('普通の日 2021-12-01', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2021-12-01');
    await page.waitForSelector('#lead-text');
    await expect(page).toMatch('次の連休は 38 日後です');
  });

  it('連休発生中 2021-01-01', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2021-01-01');
    await page.waitForSelector('marquee');
    await expect(page).toMatch('連休発生中です！！！');
  });

  it('有給チャンスを教えてくれる 2021-01-13', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2021-01-13');
    await expect(page).toMatch('次の連休は 108 日後ですが、2021-02-12 に有給を取れば 29 日後に連休チャンス！');
  });
});
