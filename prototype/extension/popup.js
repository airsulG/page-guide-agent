const DEFAULTS_URL = "default-guides.json";
const SERVICE_URL = "http://127.0.0.1:8765/guides.json";
// Agent 管理的任务目录固定路径；用户需在扩展详情页开启「允许访问文件网址」
const TASKS_BASE_URL = "file:///Users/zhouqi/Desktop/%E5%B7%A5%E4%BD%9C%E5%8C%BA/51-page-guide-agent/prototype/service/tasks";
const INDEX_URL = `${TASKS_BASE_URL}/index.json`;

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

async function fetchFromService() {
  try {
    const res = await fetch(SERVICE_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const guides = Array.isArray(data) ? data : data.guides || [];
    if (!guides.length) throw new Error("服务返回空任务包");
    await chrome.storage.local.set({ pga_guides: guides, pga_source: "service" });
    return guides;
  } catch (e) {
    const st = document.getElementById("status");
    st.textContent = `Agent 服务不可用（${e.message}），使用本地缓存`;
    st.className = "err";
    const stored = await chrome.storage.local.get("pga_guides");
    return Array.isArray(stored.pga_guides) && stored.pga_guides.length ? stored.pga_guides : null;
  }
}

async function refreshGuides() {
  const fromFile = await fetchFromFile();
  if (Array.isArray(fromFile)) return fromFile;
  const fromService = await fetchFromService();
  if (Array.isArray(fromService)) return fromService;
  const st = document.getElementById("status");
  st.textContent = `文件读取失败（${fromFile.error}），HTTP 服务也不可用；使用本地缓存`;
  st.className = "err";
  const stored = await chrome.storage.local.get("pga_guides");
  return Array.isArray(stored.pga_guides) && stored.pga_guides.length ? stored.pga_guides : null;
}

function matches(guide, url) {
  const pattern = guide.pageBinding?.urlPattern || "";
  return url.includes(pattern.replace(/^https?:\/\//, ""));
}

async function loadGuides() {
  const stored = await chrome.storage.local.get("pga_guides");
  if (Array.isArray(stored.pga_guides) && stored.pga_guides.length) return stored.pga_guides;
  const res = await fetch(chrome.runtime.getURL(DEFAULTS_URL));
  const data = await res.json();
  return data.guides || [];
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
  if (matched.length) {
    pageLine.innerHTML = `当前页面匹配 <b>${matched.length}</b> 个任务指引`;
  } else {
    pageLine.textContent = "当前页面没有匹配的任务指引";
  }
  list.innerHTML = "";
  if (!matched.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "可以先在别的页面播放，或导入适用于本页的 guides.json";
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
    play.addEventListener("click", async () => {
      await sendToActiveTab({ type: "PGA_PLAY", guide });
      window.close();
    });
    card.append(info, play);
    list.appendChild(card);
  }
}

document.getElementById("stop").addEventListener("click", async () => {
  await sendToActiveTab({ type: "PGA_STOP" });
  window.close();
});

document.getElementById("reload").addEventListener("click", async () => {
  const guides = await refreshGuides();
  if (!guides) return;
  const tab = await activeTab();
  renderList(guides, tab?.url || "");
});

(async () => {
  let [guides, tab] = await Promise.all([loadGuides(), activeTab()]);
  const fresh = await refreshGuides();
  if (fresh) guides = fresh;
  renderList(guides, tab?.url || "");
})();
