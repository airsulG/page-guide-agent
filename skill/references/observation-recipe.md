# 页面观察方法（playwright-core + 本机 Chrome）

已验证的最小连接方式（macOS，Chrome 正式版）：

```js
const { chromium } = require("playwright-core");
const os = require("os"); const path = require("path");
const context = await chromium.launchPersistentContext(
  path.join(os.tmpdir(), "page-guide-agent-profile"),
  { channel: "chrome", headless: false, viewport: { width: 1440, height: 900 } }
);
const page = context.pages()[0] || (await context.newPage());
```

观察顺序：

1. `page.goto(url, { waitUntil: "domcontentloaded" })` + `networkidle`（30s 容错）。
2. `page.evaluate` 里采集：标题、h1-h3 文本、button 文本、input（type/placeholder/aria-label）、候选行（卡片/列表项）文本样本。
3. 候选行选择器注意引号转义：`a[href*="/models/"]` 在 JS 字符串里要写成 `"a[href*=\"/models/\"]"`。
4. 需要模拟点击时用完整事件序列（mousedown → mouseup → click，带 bubbles），部分站点对裸 `el.click()` 无响应。
5. 观察脚本样例：`/Users/zhouqi/Desktop/工作区/51-page-guide-agent/prototype/cdp/t2-extract.js`。
