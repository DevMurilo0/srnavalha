import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 768, 1440]) {
  test(`fluxo simplificado de agendamento em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/agendar");
    await expect(page.getByText("Serviço", { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /COM QUEM/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Qualquer profissional/i }).click();
    await page.getByRole("button", { name: /Continuar/i }).click();

    const previousMonth = page.getByRole("button", { name: "Mês anterior" });
    await expect(previousMonth).toBeDisabled();
    const availableDay = page
      .locator(".booking-month-grid button:not(:disabled)")
      .first();
    await availableDay.click();
    await expect(page.getByText("HORÁRIOS DISPONÍVEIS")).toBeVisible();
    await page.locator(".booking-times button").first().click();
    await expect(page.getByText("HORÁRIO RESERVADO PARA VOCÊ")).toBeVisible();
    await expect(page.locator(".booking-summary-hold strong")).toContainText(
      /06:5|07:0/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({
      path: `artifacts/phase-1.3/calendar-${width}.png`,
      fullPage: true,
    });

    await page.getByRole("button", { name: /Continuar/i }).click();
    await page.getByLabel("Nome").fill("Murilo");
    await page.getByLabel("WhatsApp").fill("81999999999");
    await page.getByRole("button", { name: /Continuar/i }).click();
    await expect(page.getByText("Serviço", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("Murilo", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: /Confirmar/i }).click();
    await expect(
      page.getByRole("heading", { name: /HORÁRIO CONFIRMADO/i }),
    ).toBeVisible();
  });
}
