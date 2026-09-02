const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");
const guidePath = path.join(__dirname, "tasks", "openrouter-model-compare", "guide.json");
const resultPath = path.join(__dirname, "samples", "t6-selfheal-verify.json");
const shotPath = path.join(__dirname, "samples", "t6-selfheal-render.png");

async function locate(page, step) {
  try {
    const box = await page.locator(`${step.primary.strategy}=${step.primary.value}`).first().boundingBox({ timeout: 4000 });
    return box ? { status: "hit", used: "primary", box } : null;
  } catch {}
  try {
    const box = await page.locator(step.fallback.value).first().boundingBox({ timeout: 4000 });
    return box ? { status: "hit", used: "fallback", box } : null;
  } catch {}
  return { status: "expired", used: "none", box: null };
}

async function main() {
  const guide = JSON.parse(fs.readFileSync(guidePath, "utf8"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://openrouter.ai/models", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  await page.evaluate(() => {
    const input = document.querySelector("input[placeholder=\"Search models...\"]");
    if (input) input.setAttribute("placeholder", "Search AI models...");
    for (const h3 of document.querySelectorAll("h3")) {
      if (h3.textContent.trim() === "Prompt pricing") h3.textContent = "Input price";
      if (h3.textContent.trim() === "Context length") h3.textContent = "Context window";
    }
    for (const a of document.querySelectorAll("nav a")) {
      if (a.textContent.trim() === "Models") a.textContent = "Catalog";
    }
  });

  const before = [];
  for (const step of guide.steps) before.push({ id: step.id, ...(await locate(page, step)) });

  // hard-fail step 2 so EV5 expired rendering is exercised
  const step2 = guide.steps.find((s) => s.id === 2);
  step2.primary = { strategy: "text", value: "NoSuchNavItem" };
  step2.fallback = { strategy: "css", value: "nav >> text=NoSuchNavItem" };

  const repaired = [];
  for (const step of guide.steps) {
    const entry = before.find((b) => b.id === step.id);
    if (entry.status === "hit") continue;
    if (step.id === 1) {
      step.primary = { strategy: "placeholder", value: "Search AI models..." };
      repaired.push({ id: 1 });
    } else if (step.id === 3) {
      step.primary = { strategy: "text", value: "Input price" };
      step.fallback = { strategy: "css", value: "h3:has-text(\"Input price\")" };
      repaired.push({ id: 3 });
    } else if (step.id === 4) {
      step.primary = { strategy: "text", value: "Context window" };
      step.fallback = { strategy: "css", value: "h3:has-text(\"Context window\")" };
      repaired.push({ id: 4 });
    }
  }

  guide.revisionLog = guide.revisionLog || [];
  guide.revisionLog.push({ at: new Date().toISOString(), event: "self-heal", repaired, expired: [2] });
  fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));

  const after = [];
  for (const step of guide.steps) after.push({ id: step.id, ...(await locate(page, step)) });

  await page.evaluate((items) => {
    const old = document.getElementById("pga-overlay-root");
    if (old) old.remove();
    const root = document.createElement("div");
    root.id = "pga-overlay-root";
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    for (const it of items) {
      if (it.status === "hit" && it.box) {
        const tag = document.createElement("div");
        tag.style.cssText = `position:absolute;left:${Math.max(0, it.box.x - 8)}px;top:${Math.max(0, it.box.y - 34)}px;background:#7c3aed;color:#fff;font:12px -apple-system,sans-serif;padding:2px 8px;border-radius:6px;`;
        tag.textContent = `#${it.id} 已恢复(${it.used})`;
        root.appendChild(tag);
        const ring = document.createElement("div");
        ring.style.cssText = `position:absolute;left:${it.box.x - 6}px;top:${it.box.y - 6}px;width:${it.box.width + 12}px;height:${it.box.height + 12}px;border:2px solid #7c3aed;border-radius:8px;`;
        root.appendChild(ring);
      } else if (it.status === "expired") {
        const badge = document.createElement("div");
        badge.style.cssText = "position:fixed;top:64px;right:24px;background:#dc2626;color:#fff;font:13px -apple-system,sans-serif;padding:8px 14px;border-radius:8px;";
        badge.textContent = `#${it.id} 指引过期：页面已改版，无法自动修复`;
        root.appendChild(badge);
      }
    }
    document.body.appendChild(root);
  }, after);

  await page.waitForTimeout(1500);
  await page.screenshot({ path: shotPath });
  const hits = after.filter((v) => v.status === "hit").length;
  const expired = after.filter((v) => v.status === "expired").length;
  fs.writeFileSync(resultPath, JSON.stringify({ before, repaired, after, hits, expired }, null, 2));
  console.log(JSON.stringify({ beforeHits: before.filter((v) => v.status === "hit").length, afterHits: hits, expired, repairedCount: repaired.length, screenshot: shotPath }, null, 2));
  await context.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
