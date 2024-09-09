import { test, expect } from "@playwright/test";

test("2024-09-10", async ({ page }) => {
  await page.goto("http://localhost:8080/holidays.html#2024-09-10");

  const section1 = await page.waitForSelector("section");
  await expect(section1.textContent()).resolves.toMatch(
    new RegExp(
      [
        "次の連休は 4 日後です",
        "2024-09-14土曜日",
        "2024-09-15日曜日",
        "2024-09-16敬老の日",
      ].join("\\s*")
    )
  );
});

test("有給チャンス 2025-02-01", async ({ page }) => {
  await page.goto("http://localhost:8080/holidays.html#2025-02-01");

  const section1 = await page.waitForSelector("section");
  await expect(section1.textContent()).resolves.toMatch(
    new RegExp(
      [
        "次の連休は 21 日後ですが、2025-02-10 に有給を取れば 7 日後に連休チャンス！",
        "2025-02-22土曜日",
        "2025-02-23天皇誕生日",
        "2025-02-24天皇誕生日 振替休日",
      ].join("\\s*")
    )
  );
});

test("no 雛祭り 2025-02-28", async ({ page }) => {
  await page.goto("http://localhost:8080/holidays.html#2025-02-28");

  const section1 = await page.waitForSelector("section");
  await expect(section1.textContent()).resolves.not.toContain("2025-03-03");
});
