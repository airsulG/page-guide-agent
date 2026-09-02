const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");
const guidePath = path.join(__dirname, "guides", "openrouter-models-guide.json");
const shotPath = path.join(__dirname, "samples", "openrouter-guide-render.png");
const resultPath = path.join(__dirname, "samples", "openrouter-guide-verify.json");

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

  const verify = [];
  for (const step of guide.steps) {
    let status = "hit";
    let used = "primary";
    let box = null;
    try {
      const el = page.locator(`${step.primary.strategy}=${step.primary.value}`).first();
      box = await el.boundingBox({ timeout: 8000 });
      if (!box) throw new Error("primary miss");
    } catch {
      try {
        const el = page.locator(step.fallback.value).first();
        box = await el.boundingBox({ timeout: 8000 });
        if (!box) throw new Error("fallback miss");
        used = "fallback";
      } catch (e) {
        status = "expired";
        used = e.message;
      }
    }
    verify.push({ id: step.id, status, used, box });
  }

  // render overlay for hits
  await page.evaluate((items) => {
    const old = document.getElementById("pga-overlay-root");
    if (old) old.remove();
    const root = document.createElement("div");
    root.id = "pga-overlay-root";
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    const placed = [];
    for (const it of items) {
      if (!it.box) continue;
      let tagTop = Math.max(0, it.box.y - 34);
      let guard = 0;
      while (placed.some((p) => Math.abs(p.left - (it.box.x - 8)) < 8 && Math.abs(p.top - tagTop) < 30) && guard < 5) {
        tagTop -= 28;
        guard += 1;
      }
      placed.push({ left: it.box.x - 8, top: tagTop });
      const tag = document.createElement("div");
      tag.style.cssText = `position:absolute;left:${Math.max(0, it.box.x - 8)}px;top:${tagTop}px;background:#7c3aed;color:#fff;font:12px -apple-system,sans-serif;padding:2px 8px;border-radius:6px;`;
      tag.textContent = `#${it.id} 命中(${it.used})`;
      root.appendChild(tag);
      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;left:${it.box.x - 6}px;top:${it.box.y - 6}px;width:${it.box.width + 12}px;height:${it.box.height + 12}px;border:2px solid #7c3aed;border-radius:8px;`;
      root.appendChild(ring);
    }
    document.body.appendChild(root);
  }, verify);

  await page.waitForTimeout(1500);
  await page.screenshot({ path: shotPath, fullPage: false });
  fs.writeFileSync(resultPath, JSON.stringify({ verifiedAt: new Date().toISOString(), verify }, null, 2));
  const hits = verify.filter((v) => v.status === "hit").length;
  console.log(JSON.stringify({ total: verify.length, hits, screenshot: shotPath, resultPath }, null, 2));
  await context.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
