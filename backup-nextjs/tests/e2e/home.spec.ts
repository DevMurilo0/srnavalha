import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 768, 1440]) {
  test(`Home redesenhada, interações e agendamento ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    await expect(page.getByRole("heading", { level: 1 })).toContainText("SEU CORTE.");
    await expect(page.locator(".sr-service")).toHaveCount(3);
    await expect(page.locator(".sr-gallery__image")).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    if (width <= 1040) {
      const menu = page.getByRole("button", { name: "Abrir menu" });
      await menu.click();
      await expect(page.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
    }

    const firstImageBefore = await page.locator(".sr-gallery__image img").first().getAttribute("src");
    await page.getByRole("button", { name: "Ver próximos trabalhos" }).click();
    await expect(page.locator(".sr-gallery__image img").first()).not.toHaveAttribute("src", firstImageBefore || "");

    const faq = page.locator(".sr-faq-item").first();
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");
    await faq.locator("summary").click();

    for (const section of await page.locator("main section").all()) {
      await section.scrollIntoViewIfNeeded();
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".sr-gallery__heading")).toBeVisible();
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.getByRole("link", { name: /AGENDAR HORÁRIO/i }).first().click();
    await expect(page).toHaveURL(/\/agendar$/);
    await expect(page.getByRole("heading", { name: /COM QUEM/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
