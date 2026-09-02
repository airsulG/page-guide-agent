const DEFAULT_GUIDE_URL = "default-guide.json";

async function currentGuide() {
  const stored = await chrome.storage.local.get("pga_guide");
  if (stored.pga_guide) return stored.pga_guide;
  const res = await fetch(chrome.runtime.getURL(DEFAULT_GUIDE_URL));
  return res.json();
}

async function sendToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // content script not injected yet (tab opened before the extension loaded):
    // inject it now, then retry the message once
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    return chrome.tabs.sendMessage(tab.id, message).catch((e) => {
      const st = document.getElementById("status");
      st.textContent = `发送失败：${e.message}`;
      st.className = "err";
      return null;
    });
  }
}

async function updateStatus() {
  const guide = await currentGuide();
  document.getElementById("status").textContent = `已加载：${guide.task}（${guide.steps.length} 步）`;
}

document.getElementById("play").addEventListener("click", async () => {
  const guide = await currentGuide();
  await sendToActiveTab({ type: "PGA_PLAY", guide });
  window.close();
});

document.getElementById("replay").addEventListener("click", async () => {
  const guide = await currentGuide();
  await sendToActiveTab({ type: "PGA_PLAY", guide });
  window.close();
});

document.getElementById("stop").addEventListener("click", async () => {
  await sendToActiveTab({ type: "PGA_STOP" });
  window.close();
});

document.getElementById("file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const guide = JSON.parse(await file.text());
  await chrome.storage.local.set({ pga_guide: guide });
  updateStatus();
});

updateStatus();
