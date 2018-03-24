const PORT = process.env['PORT'] || 8383;

describe('index', () => {
  const url = `http://localhost:${PORT}/holidays.html`;

  it('普通の日 2018-04-01', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2018-04-01');
    await page.waitForSelector('#lead-text');
    await expect(page).toMatch('次の連休は 27 日後です');
  });

  it('連休発生中 2018-01-01', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2018-01-01');
    await page.waitForSelector('marquee');
    await expect(page).toMatch('連休発生中です！！！');
  });

  it('有給チャンスを教えてくれる 2017-11-06', async () => {
    const page = await browser.newPage();
    await page.goto(url + '#2017-11-06');
    await expect(page).toMatch('次の連休は 54 日後ですが、2017-11-24 に有給を取れば 17 日後に連休チャンス！');
  });
});
