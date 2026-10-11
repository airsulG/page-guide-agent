# 开发与检查说明

以下说明 MCP 实现、开发自动更新和历史材料。真实内置浏览器验收状态见 [Task 07](../.TASK/07-mcp-page-annotations.md)，授权与团队范围见 [AGENTS](../AGENTS.md)。

## 环境与依赖

根包保持 CommonJS，新 Node 源码用 `.mjs`。MCP SDK、ws、Zod 与 schema 转换由锁文件固定；jsdom 仅做 DOM 算法检查。当前统一使用 Node 24 或更新版本。后台 WebSocket 心跳依赖 Chrome 116 及以上，manifest 明确最低版本。

首次在根目录运行 `npm ci`。旧 `playwright-core` 只用于历史 CDP 脚本，不提供当前 MCP 通信。

## MCP 与开发运行

1. **启动服务。** 根目录运行 `npm run guide:dev`，仅监听 `127.0.0.1:8767`，生成开发文件并监听 `src/extension/`。端口冲突先辨认已有服务，不关闭别的进程，也不私自换端口导致已安装插件断开。
2. **首次加载后台。** 内置浏览器已有 `prototype/extension/`；首次替换 0.1.0 后由 Karl 点击一次扩展 ↻，此后保存源码自动构建与重载。不要手改输出目录。
3. **取得 MCP 工具。** Codex 的 `page-guide-agent` 配置启动 `src/mcp.mjs`；已有会话未发现时重载该 MCP 服务或在后续会话使用。`node scripts/call.mjs list` 用真实 SDK 检查协议，不能说成当前 Codex 原生工具列表已经更新。
4. **观察后标注。** 打开 `http://127.0.0.1:8767/fixture`，调用页面列表、检查和批量标注，参数见 [协议](protocols/mcp-annotations.md)。首次成功标注选定这个测试页；重载只刷新它仍在同一 URL 的页面，并恢复测试标注。
5. **检查正式输出。** `npm run guide:build -- --production` 生成 `build/extension/`。`npm run guide:serve` 运行正式桥接，不监听源码、不重载扩展或网页。两份服务使用同一端口，先停止上一份；正式目录另行加载，不替换日常开发目录。

通知在全量语法校验与文件生成成功后发出；同版本不重复重载。编译错误保留上一版文件，修复后继续。后台用 storage.local 保存实例、测试页和一次性重载状态，先消费记录再核对版本与 URL；不刷新当前活动页或全部网页。20 秒 WebSocket 心跳维持连接，1 分钟 alarm 在断线或 worker 再次启动时尝试恢复。

当前监听只覆盖 src/extension/。修改 src/contract.mjs 后须重启本项目开发服务，让桥接重新加载 schema；新 SDK 客户端也需重新初始化。扩展重载不会自动刷新业务页；需要检查新渲染器时先观察当前输入与 URL，只刷新明确指定的验证页面，再取得新 page_id，不向旧句柄重放请求。当前 connector 的编号贴近对象，以无箭头线段连接名称，全部常驻，每项 color 可独立设置；旧 marker 兼容、正常输入与实际颜色检查见 Task 08。

开发页允许整页刷新，输入和展开状态可能丢失；暂不提供局部热更新。测试恢复只保存标注，不能当成业务页面恢复。正式 MCP 仍有本机 WebSocket 和 alarm，属于产品通信；开发重载脚本不进入正式产物。

密钥在 `.page-guide/connection.json` 和生成的 `config.js`，已忽略并按私有文件创建，不提交或复制到截图。Codex 配置用本机 Node 绝对路径，升级 Node 后检查命令是否仍存在；其他 MCP 配置不改动。

## 官方扩展开发工具

本机已安装 [chrome-extensions](</Users/zhouqi/.codex/skills/chrome-extensions/SKILL.md>) 与 [modern-web-guidance](</Users/zhouqi/.codex/skills/modern-web-guidance/SKILL.md>)。它们分别补充扩展开发与商店发布知识，以及现代浏览器 API、定位、性能和兼容性指南。官方文件保留原文，产品方向与行动授权仍由项目要求决定；Skill 中提及侧栏、弹窗或教程，不构成恢复这些产品界面的要求。

安装使用 skill-installer 的 GitHub 脚本，来源、固定提交与本地保存版本见 [Task 06](../.TASK/06-extension-development-tools.md)。这是本地 Skill 安装，不是浏览器插件安装。Skill 会在后续轮次被发现；不依赖全局 npm 安装，指南可以按需检索和读取：

```sh
npx --yes modern-web-guidance@latest search "position a tooltip next to a target element"
npx --yes modern-web-guidance@latest retrieve position-aware-tooltips
```

现有 Codex 配置中的 `chrome-devtools` MCP 已增加 `--categoryExtensions`。独立启动检查已返回 `install_extension`、`list_extensions`、`reload_extension`、`trigger_extension_action` 与 `uninstall_extension`。运行中的会话未因配置文件修改而自动刷新；需要 MCP 服务重新加载后才能取得新增工具。本次只检查了启动与工具发现，没有调用浏览器扩展安装。

DevTools MCP 管理它实际连接的 Chrome，不能直接认作内置浏览器。本产品使用本机 MCP 桥接调用已配对扩展，开发更新用扩展自身重载，不依赖另一个 Chrome 的安装工具。

Computer Use 禁止自动访问 `chrome://extensions/` 并禁止绕过，因此首次加载由 Karl 手动完成。0.1.0 的真实兼容证据见 Task 06；当前 0.2.0 manifest 移除 Side Panel 和 file 访问，只匹配 HTTP/HTTPS。Karl 已完成新后台首次重载，MCP 与自动更新检查通过，不需要每次重复手动重载。

## 现有运行入口

| 内容 | 方法与预期结果 | 副作用或条件 |
|---|---|---|
| 软件说明演示 | 根目录运行 `python3 -m http.server 8766 --bind 127.0.0.1 --directory .PROTOTYPE/surface-tutorials`，打开 `/clash-verge-guide.html` | 仅在本机提供静态文件，图片在同目录 assets；不是实时标注产品 |
| 当前开发插件 | 已加载 `prototype/extension/`，由 `npm run guide:dev` 生成和更新 | 目录已变为 0.2.0 MCP 实现；旧版从 Git 历史追溯，不覆盖当前加载目录 |
| 旧任务包 | `prototype/service/tasks/index.json` 及 guide 保留；[旧说明](../prototype/service/README.md)仅解释历史 | 当前插件不读取；历史侧栏曾依赖 file URL，不能按旧说明配置当前产品 |
| 历史 HTTP 服务 | `python3 -m http.server 8765 --bind 127.0.0.1 --directory prototype/service` | 旧源码仍有 `/guides.json` fallback，但此文件不在仓库；不要把服务能启动当作 fallback 可用 |
| CDP 连接 | 根目录运行 `node prototype/cdp/t1-connect.js`，查看 JSON 输出和真实页面 | 会打开独立临时 Chrome profile 并访问 Semrush，不复用日常登录状态 |
| DOM、定位、持久化与第二阶段回归 | `prototype/cdp/t2-extract.js`、`t4-render-verify.js`、`t5-persist-reload.js`、`t6-selfheal.js`、`t7-phase2-walkthrough.js` | 会访问 OpenRouter 并写回 samples、guide 或截图；按本次授权与影响选择，不为文档迁移全部运行 |

静态服务成功应实际打开 HTML，并确认图片返回成功；端口已占用时选择空闲端口，完成后停止本次服务。旧扩展验收需辨认实际加载目录、代码版本和任务来源，不能以内容脚本注入或合成事件替代真实插件验收。新内置浏览器验收需另确认实际连接的浏览器与标签页。

## 修改后的检查

整页帮助使用 `page_guide_inventory` 获取当前语义组件、指标标签和表格单元格，结合真实页面补齐说明后调用 `page_guide_help`。可注册视口外对象，默认不显示标注；悬停才显示知识，教程内可用键盘阅读同一份内容。旧常驻 connector 保留兼容。修改合同或通信限额后重启本项目服务；扩展更新后仅刷新指定业务测试页，再取得新页面句柄。

Task 09 的实际样本和辅助执行脚本放在 `.PROTOTYPE/validation/task-09/`；它不是预置网站库。`node .PROTOTYPE/validation/task-09/run-case.mjs` 只作用于已经打开并接通扩展的指定 pump.fun 页面，重新扫描、生成本次样本并注册帮助。它不打开 Chrome，不连接钱包，不提交交易；页面状态改变后须重新核对内容和覆盖。

`npm test` 检查参数、桥接、DOM 算法、重载状态和正式文件；`npm run guide:build` 生成开发文件。自动测试使用模拟传输与 DOM，不替代真实插件。真实验收用 SDK 调用安装扩展，并通过内置浏览器 DOM、截图和正常操作检查。

文档迁移检查文件对应、纯移动哈希、本地链接及章节、HTML 资源、工作图、历史状态与 Git diff；只修改入口时不重跑会覆盖旧证据的 CDP 检查。代码变化时根据实际影响选择真实页面、定位失败、清理、旧兼容任务或插件验收，详见模块标准和原 Task。

`prototype/cdp/samples/` 和旧任务 guide 是脚本可能更新的产物，运行前核对当前修改与授权，完成后把实际版本、命令、结果和未覆盖范围写入原 Task。本次迁移没有改写这些产物。

## 恢复与接续

文档迁移前的 main 基线为 `c13ae5e`，逐文件对应与检查记录在 [Task 05](../.TASK/05-workspace-migration.md)。需要恢复时先核对后续修改并遵守版本恢复授权，不能无条件覆盖工作区。恢复项目工作从 AGENTS、适用 EVAL、模块规格和原任务开始；不需要先运行初始化器。
