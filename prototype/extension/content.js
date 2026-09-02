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
  const playStep = () => {
    pgaRoot.innerHTML = "";
    if (i >= guide.steps.length) {
      const done = document.createElement("div");
      done.style.cssText = "position:fixed;top:64px;right:24px;background:#16a34a;color:#fff;font:13px -apple-system,sans-serif;padding:8px 14px;border-radius:8px;";
      done.textContent = `重播完成（${guide.steps.length} 步）`;
      pgaRoot.appendChild(done);
      return;
    }
    const step = guide.steps[i];
    const res = pgaLocate(step);
    if (res) {
      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;left:${res.box.x - 6}px;top:${res.box.y - 6}px;width:${res.box.width + 12}px;height:${res.box.height + 12}px;border:2px solid #7c3aed;border-radius:8px;box-shadow:0 0 0 4000px rgba(0,0,0,0.12);`;
      pgaRoot.appendChild(ring);
      const bubble = document.createElement("div");
      bubble.style.cssText = `position:absolute;left:${Math.max(8, res.box.x)}px;top:${Math.max(64, res.box.y + res.box.height + 10)}px;max-width:380px;background:#7c3aed;color:#fff;font:13px/1.5 -apple-system,sans-serif;padding:10px 12px;border-radius:10px;`;
      bubble.textContent = `${i + 1}/${guide.steps.length} ${step.comment}`;
      pgaRoot.appendChild(bubble);
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
