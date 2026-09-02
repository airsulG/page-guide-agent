const DEFAULTS_URL = "default-guides.json";

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

document.getElementById("file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = JSON.parse(await file.text());
  const guides = Array.isArray(data) ? data : data.guides || [data];
  await chrome.storage.local.set({ pga_guides: guides });
  const tab = await activeTab();
  renderList(guides, tab?.url || "");
  const st = document.getElementById("status");
  st.textContent = `已导入 ${guides.length} 个任务指引`;
});

(async () => {
  const [guides, tab] = await Promise.all([loadGuides(), activeTab()]);
  renderList(guides, tab?.url || "");
})();
