const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");
const outPath = path.join(__dirname, "samples", "openrouter-models.json");

async function main() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://openrouter.ai/models", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  const inventory = await page.evaluate(() => {
    const text = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
    const attr = (el, name) => el.getAttribute(name) || "";
    const unique = (items) => Array.from(new Set(items)).slice(0, 40);

    const controls = {
      buttons: unique(Array.from(document.querySelectorAll("button")).map(text)),
      inputs: Array.from(document.querySelectorAll("input, select, textarea")).slice(0, 20).map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: attr(el, "type"),
        placeholder: attr(el, "placeholder"),
        ariaLabel: attr(el, "aria-label"),
      })),
    };

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .slice(0, 30)
      .map((el) => ({ tag: el.tagName.toLowerCase(), text: text(el) }));

    const grid = document.querySelector("main") || document.body;
    const rows = Array.from(
      grid.querySelectorAll("a[href*=\"/models/\"], article, li")
    ).slice(0, 60);

    return {
      url: location.href,
      title: document.title,
      headings,
      controls,
      candidateRowCount: rows.length,
      rows: rows.slice(0, 12).map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: text(el),
      })),
    };
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2));
  console.log(JSON.stringify({
    headings: inventory.headings.length,
    buttons: inventory.controls.buttons.length,
    inputs: inventory.controls.inputs.length,
    candidateRows: inventory.candidateRowCount,
    sampleRows: inventory.rows.length,
    saved: outPath,
  }, null, 2));
  await context.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
