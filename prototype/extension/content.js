let pgaTimers = [];
let pgaAdvance = null;
let pgaState = null; // { guide, i, watcher, missSince, stepEl, stepType, stepValue, done, clicked }
window.pgaState = () => pgaState;

function pgaLocateTarget(step) {
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
  if (!el) el = byStrategy(step.fallback);
  return el;
}
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
  pgaState = { guide, i: 0, watcher: null, missSince: 0 };
  pgaRoot = document.createElement("div");
  pgaRoot.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
  document.body.appendChild(pgaRoot);
  localStorage.setItem("pga_last_guide", JSON.stringify(guide));
  let i = 0;
  const playBadge = document.createElement("div");
  playBadge.style.cssText = "position:fixed;top:20px;right:20px;background:rgba(23,23,26,0.88);backdrop-filter:blur(8px);color:#fff;font:12px/1 -apple-system,sans-serif;padding:7px 8px 7px 14px;border-radius:99px;z-index:2147483647;display:flex;align-items:center;gap:8px;pointer-events:auto;";
  const badgeText = document.createElement("span");
  badgeText.textContent = `${Math.min(i + 1, guide.steps.length)} / ${guide.steps.length}`;
  playBadge.appendChild(badgeText);
  const nextBtn = document.createElement("button");
  nextBtn.style.cssText = "appearance:none;border:none;border-radius:99px;background:#8b5cf6;color:#fff;font:12px -apple-system,sans-serif;padding:4px 10px;cursor:pointer;";
  nextBtn.textContent = "下一步 →";
  playBadge.appendChild(nextBtn);
  pgaRoot.appendChild(playBadge);

  const advance = () => {
    if (i >= guide.steps.length) return;
    i += 1;
    playStep();
  };
  pgaAdvance = advance;
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    advance();
  });

  const playStep = () => {
    pgaRoot.querySelectorAll(".pga-step").forEach((n) => n.remove());
    if (i >= guide.steps.length) {
      const done = document.createElement("div");
      done.className = "pga-step";
      done.style.cssText = "position:fixed;top:64px;right:24px;background:rgba(22,163,74,0.95);color:#fff;font:13px -apple-system,sans-serif;padding:9px 14px;border-radius:10px;box-shadow:0 6px 20px rgba(22,163,74,0.3);";
      done.textContent = `重播完成（${guide.steps.length} 步）`;
      badgeText.textContent = `完成 ${guide.steps.length} / ${guide.steps.length}`;
      nextBtn.remove();
      pgaTimers.push(setTimeout(() => pgaClear(), 4000));
      if (pgaState) {
        clearInterval(pgaState.watcher);
        pgaState = null;
      }
      pgaRoot.appendChild(done);
      return;
    }
    const step = guide.steps[i];
    const el = pgaLocateTarget(step);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const box = el.getBoundingClientRect();
      const res = { used: el ? "primary" : "fallback", box };
      pgaState.missSince = 0;
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
      const actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:14px;margin-top:8px;font-size:11px;font-weight:600;pointer-events:auto;white-space:nowrap;align-items:center;";
      const collapse = document.createElement("span");
      collapse.style.cursor = "pointer";
      collapse.textContent = "收起 ▾";
      const detail = document.createElement("span");
      detail.style.cursor = "pointer";
      detail.style.opacity = "0.9";
      if (step.lesson) {
        detail.style.display = "inline-flex";
        detail.style.alignItems = "center";
        detail.style.gap = "4px";
        detail.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span>深入了解</span>`;
      }
      actions.append(collapse);
      if (step.lesson) actions.append(detail);
      bubble.appendChild(actions);
      collapse.addEventListener("click", (e) => {
        e.stopPropagation();
        bubble.style.display = "none";
        ring.style.display = "none";
        const mini = document.createElement("div");
        mini.className = "pga-step";
        mini.style.cssText = "position:fixed;left:16px;bottom:16px;background:rgba(23,23,26,0.92);backdrop-filter:blur(8px);color:#fff;font:12px -apple-system,sans-serif;padding:8px 12px;border-radius:99px;display:flex;align-items:center;gap:10px;pointer-events:auto;z-index:2147483647;";
        mini.textContent = `${i + 1}/${guide.steps.length} 已收起`;
        const expand = document.createElement("span");
        expand.style.cssText = "color:#a78bfa;font-weight:600;cursor:pointer;";
        expand.textContent = "展开";
        expand.addEventListener("click", (e) => {
          e.stopPropagation();
          mini.remove();
          bubble.style.display = "";
          ring.style.display = "";
        });
        mini.appendChild(expand);
        pgaRoot.appendChild(mini);
      });
      if (step.lesson) {
        detail.addEventListener("click", (e) => {
          e.stopPropagation();
          try {
            chrome.runtime.sendMessage({ type: "PGA_SHOW_LESSON", step: { comment: step.comment, lesson: step.lesson, index: i + 1, total: guide.steps.length } });
          } catch {}
        });
      }
      pgaRoot.appendChild(bubble);
      badgeText.textContent = `${i + 1} / ${guide.steps.length}`;
      if (step.completion) {
        nextBtn.textContent = "等待操作…";
        nextBtn.style.opacity = "0.6";
        pgaState.stepEl = el;
        pgaState.stepType = step.completion.type;
        pgaState.stepValue = step.completion.valueContains || "";
        pgaState.done = false;
        if (!pgaState.watcher) {
          pgaState.watcher = setInterval(() => pgaCheckCompletion(step), 400);
        }
      } else {
        nextBtn.textContent = "下一步 →";
        nextBtn.style.opacity = "1";
      }
    } else {
      if (!pgaState.missSince) pgaState.missSince = Date.now();
      const badge = document.createElement("div");
      badge.className = "pga-step";
      badge.style.cssText = "position:fixed;top:64px;right:24px;background:#dc2626;color:#fff;font:13px -apple-system,sans-serif;padding:8px 14px;border-radius:8px;";
      badge.textContent = `#${step.id} 指引过期：页面已改版，无法自动定位`;
      pgaRoot.appendChild(badge);
    }
    badgeText.textContent = `${i + 1} / ${guide.steps.length}`;
  };
  playStep();
}

function pgaCheckCompletion(step) {
  if (!pgaState || pgaState.done) return;
  const el = pgaState.stepEl;
  if (!el || !document.contains(el)) return;
  const type = pgaState.stepType;
  let done = false;
  if (type === "input") {
    done = (el.value || "").trim().length > 0 && (!pgaState.stepValue || el.value.toLowerCase().includes(pgaState.stepValue.toLowerCase()));
  } else if (type === "click") {
    done = !!pgaState.clicked;
  } else if (type === "check") {
    done = !!el.checked;
  }
  if (done) {
    pgaState.done = true;
    pgaAdvance();
  }
}

document.addEventListener("dblclick", () => {
  const saved = localStorage.getItem("pga_last_guide");
  if (saved) pgaPlay(JSON.parse(saved));
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PGA_PLAY") pgaPlay(msg.guide);
  if (msg.type === "PGA_STOP") pgaClear();
});

document.addEventListener("click", (e) => {
  if (!pgaState || pgaState.done || pgaState.stepType !== "click") return;
  const target = pgaState.stepEl;
  if (!target) return;
  if (target.contains(e.target) || e.target === target) {
    pgaState.clicked = true;
  }
}, true);

document.addEventListener("input", (e) => {
  if (!pgaState || pgaState.stepType !== "input") return;
  if (e.target === pgaState.stepEl) pgaCheckCompletion(null);
}, true);

if (location.hostname.includes("openrouter.ai") && localStorage.getItem("pga_autoplay") === "1") {
  const saved = localStorage.getItem("pga_last_guide");
  if (saved) setTimeout(() => pgaPlay(JSON.parse(saved)), 1200);
}
