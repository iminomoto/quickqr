import { test, expect, type Page } from "@playwright/test";

// E2E regression coverage for behavior the node-only unit suite can't reach:
// splash dismissal + inert gating, ARIA semantics, and the scannability
// warning bar. Each test gets a fresh context, so the splash plays on load.

async function dismissSplash(page: Page) {
  const skip = page.getByRole("button", { name: "Skip" });
  await skip.waitFor({ timeout: 15_000 });
  await page.keyboard.press("Escape");
  await expect(skip).toHaveCount(0);
}

test.describe("splash", () => {
  test("background is inert until the splash is dismissed", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Skip" }).waitFor();
    await expect(page.locator("div.noise").first()).toHaveAttribute("inert", "");

    await page.keyboard.press("Escape");
    await expect(page.locator("div.noise").first()).not.toHaveAttribute("inert", "");
  });

  test("Escape dismisses and the skip is remembered across reloads", async ({ page }) => {
    await page.goto("/");
    await dismissSplash(page);
    expect(await page.evaluate(() => localStorage.getItem("quickqr-splash-seen"))).toBe("true");

    await page.reload();
    await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
  });
});

test.describe("accessibility semantics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await dismissSplash(page);
  });

  test("option groups are named radiogroups with a checked radio", async ({ page }) => {
    for (const name of ["Error correction level", "Dot style", "Eye frame style", "Eye ball style"]) {
      const group = page.locator(`[role="radiogroup"][aria-label="${name}"]`);
      await expect(group).toBeVisible();
      await expect(group.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
    }
  });

  test("WiFi security group exposes radio semantics", async ({ page }) => {
    await page.getByRole("tab", { name: /wifi/i }).click();
    const security = page.locator('[role="radiogroup"][aria-label="Security"]');
    await expect(security).toBeVisible();
    await expect(security.locator('[aria-checked="true"]')).toHaveCount(1);
  });

  test("FAQ buttons toggle aria-expanded and control a real panel", async ({ page }) => {
    const button = page.getByRole("button", { name: "What is a QR code?" });
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const panelId = await button.getAttribute("aria-controls");
    await expect(page.locator(`#${panelId}`)).toBeVisible();
  });

  test("inputs show a visible keyboard focus ring", async ({ page }) => {
    const input = page.locator("input.input-ve").first();
    await input.focus();
    // Text inputs always match :focus-visible, so the ring must be applied.
    expect(await input.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe("2px");
  });
});

test.describe("scannability guard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await dismissSplash(page);
    await page.getByRole("tab", { name: /url/i }).click();
    await page.getByLabel("Web address").fill("https://example.com");
  });

  test("no warning for the default dark-on-light colors", async ({ page }) => {
    await expect(page.locator("text=/bytes/").first()).toBeVisible();
    // Scope to the preview bottom bar's warnings — "Quiet zone" also appears
    // as a settings label in the customization panel.
    await expect(
      page.locator("text=/Light-on-dark QR codes|Low contrast \\(|Quiet zone is off/"),
    ).toHaveCount(0);
  });

  test("inverted colors warn and restoring them clears the warning", async ({ page }) => {
    const fg = page.getByLabel("foreground hex value").first();
    const bg = page.getByLabel("background hex value").first();

    await fg.fill("#ffffff");
    await bg.fill("#000000");
    await expect(page.locator("text=/Light-on-dark/")).toBeVisible();

    await fg.fill("#000000");
    await bg.fill("#ffffff");
    await expect(page.locator("text=/Light-on-dark/")).toHaveCount(0);
  });
});

test("no uncaught page errors on load", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  await dismissSplash(page);
  expect(errors).toEqual([]);
});
