let pgaTimers = [];
let pgaRoot = null;

function pgaClear() {
  pgaTimers.forEach(clearTimeout);
  pgaTimers = [];
  if (pgaRoot) {
    pgaRoot.remove();
    pgaRoot = null;
  }
}

function pgaLocate(step) {
  const byStrategy = (s) => {
    if (!s) return null;
    try {
      if (s.strategy === "placeholder") return document.querySelector(`input[placeholder="${s.value}"]`);
      if (s.strategy === "css") return document.querySelector(s.value);
      if (s.strategy === "text") {
        const xp = `//*[normalize-space(text())="${s.value}"]`;
        return document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }
    } catch {}
    return null;
  };
  let el = byStrategy(step.primary);
  let used = "primary";
  if (!el) {
    el = byStrategy(step.fallback);
    used = "fallback";
  }
  if (!el) return null;
  el.scrollIntoView({ block: "center", behavior: "instant" });
  return { used, box: el.getBoundingClientRect() };
}

function pgaPlay(guide) {
  pgaClear();
  pgaRoot = document.createElement("div");
  pgaRoot.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
  document.body.appendChild(pgaRoot);
  localStorage.setItem("pga_last_guide", JSON.stringify(guide));
  let i = 0;
  const playBadge = document.createElement("div");
  playBadge.style.cssText = "position:fixed;top:20px;right:20px;background:rgba(23,23,26,0.88);backdrop-filter:blur(8px);color:#fff;font:12px/1 -apple-system,sans-serif;padding:7px 12px;border-radius:99px;z-index:2147483647;";
  const badgeText = document.createElement("span");
  badgeText.textContent = `${Math.min(i + 1, guide.steps.length)} / ${guide.steps.length}`;
  playBadge.appendChild(badgeText);
  pgaRoot.appendChild(playBadge);
  const playStep = () => {
    pgaRoot.querySelectorAll(".pga-step").forEach((n) => n.remove());
    if (i >= guide.steps.length) {
      const done = document.createElement("div");
      done.className = "pga-step";
      done.style.cssText = "position:fixed;top:64px;right:24px;background:rgba(22,163,74,0.95);color:#fff;font:13px -apple-system,sans-serif;padding:9px 14px;border-radius:10px;box-shadow:0 6px 20px rgba(22,163,74,0.3);";
      done.textContent = `重播完成（${guide.steps.length} 步）`;
      badgeText.textContent = `完成 ${guide.steps.length} / ${guide.steps.length}`;
      pgaRoot.appendChild(done);
      return;
    }
    const step = guide.steps[i];
    const res = pgaLocate(step);
    if (res) {
      const ring = document.createElement("div");
      ring.className = "pga-step";
      ring.style.cssText = `position:absolute;left:${res.box.x - 6}px;top:${res.box.y - 6}px;width:${res.box.width + 12}px;height:${res.box.height + 12}px;border:2px solid #8b5cf6;border-radius:10px;box-shadow:0 0 0 4000px rgba(0,0,0,0.18), 0 0 24px rgba(139,92,246,0.45);`;
      pgaRoot.appendChild(ring);
      const bubble = document.createElement("div");
      bubble.className = "pga-step";
      bubble.style.cssText = `position:absolute;left:${Math.max(8, res.box.x)}px;top:${Math.max(64, res.box.y + res.box.height + 12)}px;max-width:400px;background:#7c3aed;color:#fff;font:13px/1.55 -apple-system,"PingFang SC",sans-serif;padding:12px 14px;border-radius:12px;box-shadow:0 8px 28px rgba(124,58,237,0.4);`;
      const stepTag = document.createElement("div");
      stepTag.style.cssText = "font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#ddd0ff;margin-bottom:4px;font-weight:600;opacity:.85;";
      stepTag.textContent = `Step ${i + 1} / ${guide.steps.length}`;
      bubble.appendChild(stepTag);
      const body = document.createElement("div");
      body.textContent = step.comment;
      bubble.appendChild(body);
      pgaRoot.appendChild(bubble);
      badgeText.textContent = `${i + 1} / ${guide.steps.length}`;
    } else {
      const badge = document.createElement("div");
      badge.style.cssText = "position:fixed;top:64px;right:24px;background:#dc2626;color:#fff;font:13px -apple-system,sans-serif;padding:8px 14px;border-radius:8px;";
      badge.textContent = `#${step.id} 指引过期：页面已改版，无法自动定位`;
      pgaRoot.appendChild(badge);
    }
    i += 1;
    pgaTimers.push(setTimeout(playStep, 4200));
  };
  playStep();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PGA_PLAY") pgaPlay(msg.guide);
  if (msg.type === "PGA_STOP") pgaClear();
});

document.addEventListener("dblclick", () => {
  const saved = localStorage.getItem("pga_last_guide");
  if (saved) pgaPlay(JSON.parse(saved));
});

if (location.hostname.includes("openrouter.ai") && localStorage.getItem("pga_autoplay") === "1") {
  const saved = localStorage.getItem("pga_last_guide");
  if (saved) setTimeout(() => pgaPlay(JSON.parse(saved)), 1200);
}
