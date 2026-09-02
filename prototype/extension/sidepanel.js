const DEFAULTS_URL = "default-guides.json";
const SERVICE_URL = "http://127.0.0.1:8765/guides.json";
const TASKS_BASE_URL = "file:///Users/zhouqi/Desktop/%E5%B7%A5%E4%BD%9C%E5%8C%BA/51-page-guide-agent/prototype/service/tasks";
const INDEX_URL = `${TASKS_BASE_URL}/index.json`;

async function fetchFromService() {
  try {
    const res = await fetch(SERVICE_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const guides = Array.isArray(data) ? data : data.guides || [];
    if (!guides.length) throw new Error("服务返回空任务包");
    await chrome.storage.local.set({ pga_guides: guides, pga_source: "service" });
    return guides;
  } catch {
    return null;
  }
}

async function fetchFromFile() {
  try {
    const res = await fetch(INDEX_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const index = await res.json();
    const guides = await Promise.all(
      (index.tasks || []).map(async (entry) => {
        const gRes = await fetch(`${TASKS_BASE_URL}/${entry.dir}/guide.json`, { cache: "no-store" });
        if (!gRes.ok) throw new Error(`${entry.dir}: HTTP ${gRes.status}`);
        const guide = await gRes.json();
        return { ...guide, id: guide.id || entry.dir };
      })
    );
    if (!guides.length) throw new Error("索引中无任务");
    await chrome.storage.local.set({ pga_guides: guides, pga_source: "file" });
    return guides;
  } catch (e) {
    return { error: e.message };
  }
}

async function refreshGuides() {
  const fromFile = await fetchFromFile();
  if (Array.isArray(fromFile)) return fromFile;
  const fromService = await fetchFromService();
  if (fromService) return fromService;
  const st = document.getElementById("status");
  st.textContent = `任务目录读取失败（${fromFile.error}）——请确认扩展已开启「允许访问文件网址」`;
  st.className = "err";
  const stored = await chrome.storage.local.get("pga_guides");
  return Array.isArray(stored.pga_guides) && stored.pga_guides.length ? stored.pga_guides : null;
}

async function loadGuides() {
  const stored = await chrome.storage.local.get("pga_guides");
  if (Array.isArray(stored.pga_guides) && stored.pga_guides.length) return stored.pga_guides;
  const res = await fetch(chrome.runtime.getURL(DEFAULTS_URL));
  const data = await res.json();
  return data.guides || [];
}

async function guideSource() {
  const stored = await chrome.storage.local.get("pga_source");
  return stored.pga_source || "内置默认";
}

function matches(guide, url) {
  const pattern = guide.pageBinding?.urlPattern || "";
  return url.includes(pattern.replace(/^https?:\/\//, ""));
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToActiveTab(message) {
  const tab = await activeTab();
  if (!tab) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    return chrome.tabs.sendMessage(tab.id, message).catch((e) => {
      const st = document.getElementById("status");
      st.textContent = `发送失败：${e.message}`;
      st.className = "err";
      return null;
    });
  }
}

function renderList(guides, url) {
  const list = document.getElementById("list");
  const matched = guides.filter((g) => matches(g, url));
  const pageLine = document.getElementById("page-line");
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {}
  const hostLine = host ? `当前页面：<b>${host}</b>` : "未识别到当前页面";
  pageLine.innerHTML = matched.length
    ? `${hostLine} · 匹配 <b>${matched.length}</b> 个任务`
    : `${hostLine} · 无匹配任务`;
  list.innerHTML = "";
  if (!matched.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "打开匹配的页面后，任务会出现在这里";
    list.appendChild(empty);
    return;
  }
  for (const guide of matched) {
    const card = document.createElement("div");
    card.className = "guide";
    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = guide.task;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${guide.steps.length} 步`;
    info.append(name, meta);
    const play = document.createElement("button");
    play.className = "play";
    play.textContent = "播放";
    play.addEventListener("click", () => sendToActiveTab({ type: "PGA_PLAY", guide }));
    card.append(info, play);
    list.appendChild(card);
  }
}

(async () => {
  let [guides, tab] = await Promise.all([loadGuides(), activeTab()]);
  const fresh = await refreshGuides();
  if (fresh) guides = fresh;
  renderList(guides, tab?.url || "");
  const source = await guideSource();
  const st = document.getElementById("status");
  if (!st.className) {
    st.textContent = `任务包：${guides.length} 条（来源：${source}）`;
  }

  chrome.tabs.onActivated.addListener(async () => {
    const t = await activeTab();
    renderList(guides, t?.url || "");
  });
  chrome.tabs.onUpdated.addListener(async (tabId, change) => {
    if (change.status !== "complete") return;
    const t = await activeTab();
    renderList(guides, t?.url || "");
  });
})();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "PGA_SHOW_LESSON") return;
  const { lesson, index, total } = msg.step;
  let card = document.getElementById("pga-lesson-card");
  if (!card) {
    card = document.createElement("div");
    card.id = "pga-lesson-card";
    card.style.cssText = `position:fixed;inset:0;background:var(--bg);z-index:10;overflow-y:auto;padding:14px;display:none;`;
    document.body.appendChild(card);
  }
  const blocksHtml = lesson.blocks.map((b) => {
    if (b.type === "text") return `<p style="margin:0 0 10px;color:var(--text);">${b.content}</p>`;
    if (b.type === "list") return `<ul style="margin:0 0 10px;padding-left:18px;color:var(--text);">${b.items.map((it) => `<li style="margin-bottom:5px;">${it}</li>`).join("")}</ul>`;
    if (b.type === "tip") return `<div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:8px;padding:9px 11px;font-size:12px;color:var(--text-2);margin-bottom:10px;"><b style="color:var(--text);">💡 要点</b><br>${b.content}</div>`;
    return "";
  }).join("");
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <button id="pga-lesson-back" style="appearance:none;border:1px solid var(--border);background:var(--surface);color:var(--text-2);border-radius:8px;padding:5px 10px;font:12px -apple-system,sans-serif;cursor:pointer;">← 返回</button>
      <span style="font-size:11px;color:var(--text-2);">Step ${index} / ${total} 知识卡</span>
    </div>
    <h2 style="font-size:15px;font-weight:600;line-height:1.4;margin-bottom:10px;">${lesson.title}</h2>
    <div style="font-size:13px;line-height:1.6;">${blocksHtml}</div>
  `;
  card.style.display = "block";
  document.getElementById("pga-lesson-back").addEventListener("click", () => { card.style.display = "none"; });
});
