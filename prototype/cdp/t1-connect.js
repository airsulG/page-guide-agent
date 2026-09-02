const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");

async function main() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://semrush.com", { waitUntil: "domcontentloaded" });
  const title = await page.title();
  const heading = await page.locator("h1").first().textContent({ timeout: 10000 });
  console.log(JSON.stringify({ title, heading: heading.trim() }, null, 2));
  await context.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
