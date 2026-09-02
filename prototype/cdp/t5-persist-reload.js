const { chromium } = require("playwright-core");
const os = require("os");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(os.tmpdir(), "page-guide-agent-profile");
const taskDir = path.join(__dirname, "tasks", "openrouter-model-compare");
const guidePath = path.join(taskDir, "guide.json");
const reloadResultPath = path.join(__dirname, "samples", "t5-reload-verify.json");

async function main() {
  const source = JSON.parse(
    fs.readFileSync(path.join(__dirname, "guides", "openrouter-models-guide.json"), "utf8")
  );
  // persistence step: seed the local task file (simulates "first session wrote the guide")
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(guidePath, JSON.stringify(source, null, 2));

  // second session: load from task file only
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
      box = await page.locator(`${step.primary.strategy}=${step.primary.value}`).first().boundingBox({ timeout: 8000 });
      if (!box) throw new Error("primary miss");
    } catch {
      try {
        box = await page.locator(step.fallback.value).first().boundingBox({ timeout: 8000 });
        if (!box) throw new Error("fallback miss");
        used = "fallback";
      } catch (e) {
        status = "expired";
        used = e.message;
      }
    }
    verify.push({ id: step.id, status, used, box });
  }

  await page.evaluate((items) => {
    const old = document.getElementById("pga-overlay-root");
    if (old) old.remove();
    const root = document.createElement("div");
    root.id = "pga-overlay-root";
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    const notes = JSON.parse(document.getElementById("pga-notes-data")?.textContent || "{}");
    for (const it of items) {
      if (it.status !== "hit" || !it.box) continue;
      const note = notes[it.id] || "";
      const tag = document.createElement("div");
      tag.style.cssText = `position:absolute;left:${Math.max(0, it.box.x - 8)}px;top:${Math.max(0, it.box.y - 34)}px;max-width:340px;background:#7c3aed;color:#fff;font:12px/1.4 -apple-system,sans-serif;padding:4px 8px;border-radius:6px;`;
      tag.textContent = `#${it.id} ${note.slice(0, 60)}${note.length > 60 ? "…" : ""}`;
      root.appendChild(tag);
      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;left:${it.box.x - 6}px;top:${it.box.y - 6}px;width:${it.box.width + 12}px;height:${it.box.height + 12}px;border:2px solid #7c3aed;border-radius:8px;`;
      root.appendChild(ring);
    }
    document.body.appendChild(root);
  }, verify);

  await page.waitForTimeout(1500);
  const shotPath = path.join(__dirname, "samples", "t5-reload-render.png");
  await page.screenshot({ path: shotPath });
  const hits = verify.filter((v) => v.status === "hit").length;
  const result = { loadedFrom: guidePath, total: verify.length, hits, verify };
  fs.writeFileSync(reloadResultPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ source: "task-file", total: verify.length, hits, screenshot: shotPath }, null, 2));
  await context.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
