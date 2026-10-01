# 开发与检查说明

以下说明现有原型和材料的实际位置，不表示内置浏览器接入已经可用。授权、提交和团队写入范围见 [AGENTS](../AGENTS.md)，产品要求见 [模块规格](modules/page-guide-agent.md)。

## 环境与依赖

根 `package.json` 使用 CommonJS，依赖 `playwright-core`，以 `package-lock.json` 锁定版本；没有 Node 版本约束、开发服务器脚本或构建脚本。需要 Node.js、npm 和本机 Chrome 运行旧 CDP 检查，静态演示可用 Python 3。确切版本在执行时读取并记入原 Task，不把某次本机版本写成长期最低要求。

首次需要安装 Node 依赖时，在仓库根使用 `npm ci` 按锁文件安装；本次迁移复用现有 `node_modules`，没有重新安装依赖。`playwright-core` 不包含浏览器，旧脚本使用 `channel: "chrome"` 调用本机 Chrome。

## 官方扩展开发工具

本机已安装 [chrome-extensions](</Users/zhouqi/.codex/skills/chrome-extensions/SKILL.md>) 与 [modern-web-guidance](</Users/zhouqi/.codex/skills/modern-web-guidance/SKILL.md>)。它们分别补充扩展开发与商店发布知识，以及现代浏览器 API、定位、性能和兼容性指南。官方文件保留原文，产品方向与行动授权仍由项目要求决定；Skill 中提及侧栏、弹窗或教程，不构成恢复这些产品界面的要求。

安装使用 skill-installer 的 GitHub 脚本，来源、固定提交与本地保存版本见 [Task 06](../.TASK/06-extension-development-tools.md)。这是本地 Skill 安装，不是浏览器插件安装。Skill 会在后续轮次被发现；不依赖全局 npm 安装，指南可以按需检索和读取：

```sh
npx --yes modern-web-guidance@latest search "position a tooltip next to a target element"
npx --yes modern-web-guidance@latest retrieve position-aware-tooltips
```

现有 Codex 配置中的 `chrome-devtools` MCP 已增加 `--categoryExtensions`。独立启动检查已返回 `install_extension`、`list_extensions`、`reload_extension`、`trigger_extension_action` 与 `uninstall_extension`。运行中的会话未因配置文件修改而自动刷新；需要 MCP 服务重新加载后才能取得新增工具。本次只检查了启动与工具发现，没有调用浏览器扩展安装。

构建由 Agent 执行项目实际的构建命令；当前原型没有构建脚本，加载目录仍是 `prototype/extension/`。DevTools MCP 的加载工具接收未打包目录绝对路径，后续修改可以重载扩展并刷新目标网页，再检查内容脚本和标注。工具默认操作自身连接的 Chrome，不能直接认作 Codex 内置浏览器；连接方式与版本条件以执行时的帮助为准。

当前 Computer Use 的 URL 策略禁止自动访问 `chrome://extensions/`，并明确禁止绕过。Karl 已手动加载 Page Guide Agent 0.1.0，随后在内置浏览器的本机 HTTP 测试页完成真实内容脚本绘制与撤下检查。检查页只保存旧格式指引，通过实际双击触发插件重播，没有注入绘制代码或模拟扩展 API；页面、截图和结果见 Task 06。现有插件仍有 Side Panel、全部网页内容脚本匹配和本地 file 访问声明，对话直接调用还需实现。

## 现有运行入口

| 内容 | 方法与预期结果 | 副作用或条件 |
|---|---|---|
| 软件说明演示 | 根目录运行 `python3 -m http.server 8766 --bind 127.0.0.1 --directory .PROTOTYPE/surface-tutorials`，打开 `/clash-verge-guide.html` | 仅在本机提供静态文件，图片在同目录 assets；不是实时标注产品 |
| 旧 Chrome 插件 | 在 Chrome 扩展页加载 `prototype/extension/`，具体配置核对 manifest 与 [旧任务包说明](../prototype/service/README.md) | 安装或替换插件需对应授权；加载目录本次未变 |
| 旧任务包 | 侧栏通过 main 的绝对 file URL 读取 `prototype/service/tasks/index.json` 及 guide | 需要允许读取 file URL；TEAM 候选不能仍读 main 任务包 |
| 历史 HTTP 服务 | `python3 -m http.server 8765 --bind 127.0.0.1 --directory prototype/service` | 旧源码仍有 `/guides.json` fallback，但此文件不在仓库；不要把服务能启动当作 fallback 可用 |
| CDP 连接 | 根目录运行 `node prototype/cdp/t1-connect.js`，查看 JSON 输出和真实页面 | 会打开独立临时 Chrome profile 并访问 Semrush，不复用日常登录状态 |
| DOM、定位、持久化与第二阶段回归 | `prototype/cdp/t2-extract.js`、`t4-render-verify.js`、`t5-persist-reload.js`、`t6-selfheal.js`、`t7-phase2-walkthrough.js` | 会访问 OpenRouter 并写回 samples、guide 或截图；按本次授权与影响选择，不为文档迁移全部运行 |

静态服务成功应实际打开 HTML，并确认图片返回成功；端口已占用时选择空闲端口，完成后停止本次服务。旧扩展验收需辨认实际加载目录、代码版本和任务来源，不能以内容脚本注入或合成事件替代真实插件验收。新内置浏览器验收需另确认实际连接的浏览器与标签页。

## 修改后的检查

`npm test` 目前仅输出 “Error: no test specified” 并退出 1，不能证明功能正确。没有 `build` 脚本，不声明 npm build 通过。

文档迁移检查文件对应、纯移动哈希、本地链接及章节、HTML 资源、工作图、历史状态与 Git diff；只修改入口时不重跑会覆盖旧证据的 CDP 检查。代码变化时根据实际影响选择真实页面、定位失败、清理、旧兼容任务或插件验收，详见模块标准和原 Task。

`prototype/cdp/samples/` 和旧任务 guide 是脚本可能更新的产物，运行前核对当前修改与授权，完成后把实际版本、命令、结果和未覆盖范围写入原 Task。本次迁移没有改写这些产物。

## 恢复与接续

文档迁移前的 main 基线为 `c13ae5e`，逐文件对应与检查记录在 [Task 05](../.TASK/05-workspace-migration.md)。需要恢复时先核对后续修改并遵守版本恢复授权，不能无条件覆盖工作区。恢复项目工作从 AGENTS、适用 EVAL、模块规格和原任务开始；不需要先运行初始化器。
