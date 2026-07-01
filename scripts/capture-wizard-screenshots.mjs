import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "@playwright/test";

const OUTPUT_DIR = path.resolve("screenshots");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const SHOULD_START_SERVER = !process.env.PLAYWRIGHT_BASE_URL;

function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          resolve();
          return;
        }
      } catch {
        // Server not ready yet.
      }

      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(tick, 500);
    };

    tick();
  });
}

function startDevServer() {
  const child = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3000"], {
    stdio: "inherit",
    shell: true,
  });

  return {
    child,
    ready: waitForServer(BASE_URL),
  };
}

async function captureWizardFlow(page) {
  await page.goto(`${BASE_URL}/`);
  await page.getByTestId("wizard-step-1").waitFor();

  await page.screenshot({ path: path.join(OUTPUT_DIR, "01-step-1-scopes.png"), fullPage: true });

  await page.locator('label.scope-item input[type="checkbox"]').first().check();
  await page.getByTestId("wizard-continue").click();
  await page.getByTestId("wizard-step-2").waitFor();
  await page.screenshot({ path: path.join(OUTPUT_DIR, "02-step-2-article.png"), fullPage: true });

  await page.getByTestId("wizard-article-url").fill("https://example.com/my-article");
  await page.getByTestId("wizard-review").click();
  await page.getByTestId("wizard-step-3").waitFor();
  await page.screenshot({ path: path.join(OUTPUT_DIR, "03-step-3-review.png"), fullPage: true });

  await page.getByTestId("wizard-generate").click();
  await page.getByTestId("wizard-step-4").waitFor();
  await page.getByTestId("wizard-consent-link").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const input = document.querySelector('[data-testid="wizard-consent-link"]');
    return input && input.value.startsWith("http");
  });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-step-4-link-ready.png"),
    fullPage: true,
  });
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let server;
  if (SHOULD_START_SERVER) {
    server = startDevServer();
    await server.ready;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await captureWizardFlow(page);
    await writeFile(
      path.join(OUTPUT_DIR, "manifest.json"),
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          steps: [
            { file: "01-step-1-scopes.png", title: "Step 1 — Scope selection" },
            { file: "02-step-2-article.png", title: "Step 2 — Article URL" },
            { file: "03-step-3-review.png", title: "Step 3 — Review" },
            { file: "04-step-4-link-ready.png", title: "Step 4 — Link ready" },
          ],
        },
        null,
        2,
      ),
    );
    console.log("Wizard screenshots saved to screenshots/");
  } finally {
    await browser.close();
    if (server) {
      server.child.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
