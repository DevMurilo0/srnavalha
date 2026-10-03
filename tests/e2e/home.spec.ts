import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 768, 1440]) {
  test(`Home e agendamento em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "SEU CORTE",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".mobile-booking")).toHaveCount(0);

    if (width < 1024) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Abrir menu" }),
      ).toBeFocused();
      await page.locator("#servicos").evaluate((element) => {
        window.scrollTo(
          0,
          element.getBoundingClientRect().top + window.scrollY + 1,
        );
      });
      await expect(page.locator(".mobile-booking")).toBeVisible();
    }

    const faq = page.locator("details").first();
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");
    await faq.locator("summary").click();

    // Reveal all sections before the full-page capture.
    for (const section of await page.locator("main section").all())
      await section.scrollIntoViewIfNeeded();
    const images = page.locator("main img, .brand-logo");
    expect(await images.count()).toBeGreaterThanOrEqual(10);
    for (const image of await images.all()) {
      await expect(image).toHaveJSProperty("complete", true);
      await expect
        .poll(() =>
          image.evaluate(
            (element) => (element as HTMLImageElement).naturalWidth,
          ),
        )
        .toBeGreaterThan(0);
    }
    await expect(page.locator(".photo-placeholder-label")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".mobile-booking")).toHaveCount(0);
    await page.screenshot({
      path: `artifacts/phase-1.2/home-${width}.png`,
      fullPage: true,
    });
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);

    await page
      .locator(".hero-copy")
      .getByRole("link", { name: "Agendar horário" })
      .click();
    await expect(page).toHaveURL(/\/agendar$/);
    await expect(
      page.getByText("Nenhum horário é reservado nesta página."),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/phase-1.2/agendar-${width}.png`,
      fullPage: true,
    });
    const bookingAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(bookingAccessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
