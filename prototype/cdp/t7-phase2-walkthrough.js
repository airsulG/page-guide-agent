const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");
const guidePath = path.join(__dirname, "..", "service", "tasks", "openrouter-model-compare", "guide.json");
const resultPath = path.join(__dirname, "samples", "t7-phase2-walkthrough.json");
const shotsDir = path.join(__dirname, "samples");

async function injectAndPlay(page, guide) {
  const code = fs.readFileSync(path.join(__dirname, "..", "extension", "content.js"), "utf8");
  // strip chrome.* API usage so the plain-page evaluation works like a real content script
  const sandboxed = code
    .replace(/chrome\.runtime\.onMessage\.addListener[\s\S]*?\}\);/, "")
    .replace(/chrome\./g, "window.__pga_noop &&");
  await page.evaluate(sandboxed);
  await page.evaluate((g) => { pgaPlay(g); }, guide);
}

async function state(page) {
  return page.evaluate(() => ({
    badge: document.querySelector("#pga-overlay-root span")?.textContent || "",
    bubble: document.querySelector(".pga-step div:nth-child(2)")?.textContent || "",
    steps: document.querySelectorAll(".pga-step").length,
  }));
}

async function main() {
  const guide = JSON.parse(fs.readFileSync(guidePath, "utf8"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome", headless: false, viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://openrouter.ai/models", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await injectAndPlay(page, guide);
  await page.waitForTimeout(800);

  const log = [];
  const snap = async (label) => {
    const s = await state(page);
    log.push({ label, ...s });
    await page.screenshot({ path: path.join(shotsDir, `t7-${label}.png`) });
    return s;
  };

  // step 1: type into search -> should auto-advance
  const s0 = await snap("step1-waiting");
  const searchSel = `input[placeholder="Search models..."]`;
  await page.click(searchSel);
  await page.type(searchSel, "claude", { delay: 40 });
  await page.waitForTimeout(1200);
  const s1 = await snap("step1-done-auto-advance");

  // step 2: click nav Models -> auto-advance
  await page.evaluate(() => {
    const st = window.pgaState();
    const el = st?.stepEl;
    if (el) {
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent("mousedown", opts));
      el.dispatchEvent(new MouseEvent("mouseup", opts));
      el.dispatchEvent(new MouseEvent("click", opts));
    }
  });
  await page.waitForTimeout(1200);
  const s2 = await snap("step2-done-auto-advance");

  // step 3: click Context length heading -> auto-advance
  await page.evaluate(() => {
    const st = window.pgaState();
    const el = st?.stepEl;
    if (el) {
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent("mousedown", opts));
      el.dispatchEvent(new MouseEvent("mouseup", opts));
      el.dispatchEvent(new MouseEvent("click", opts));
    }
  });
  await page.waitForTimeout(1200);
  const s3 = await snap("step3-done-auto-advance");

  // step 4: click first model card -> finish
  await page.evaluate(() => {
    const st = window.pgaState();
    const el = st?.stepEl;
    if (el) {
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent("mousedown", opts));
      el.dispatchEvent(new MouseEvent("mouseup", opts));
      el.dispatchEvent(new MouseEvent("click", opts));
    }
  });
  await page.waitForTimeout(1500);
  const s4 = await snap("step4-completed");

  fs.writeFileSync(resultPath, JSON.stringify({ log }, null, 2));
  console.log(JSON.stringify({ s0, s1, s2, s3, s4 }, null, 2));
  await context.close();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
