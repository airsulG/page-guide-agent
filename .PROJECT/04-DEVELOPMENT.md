# 开发与检查说明

以下说明现有原型和材料的实际位置，不表示内置浏览器接入已经可用。授权、提交和团队写入范围见 [AGENTS](../AGENTS.md)，产品要求见 [模块规格](modules/page-guide-agent.md)。

## 环境与依赖

根 `package.json` 使用 CommonJS，依赖 `playwright-core`，以 `package-lock.json` 锁定版本；没有 Node 版本约束、开发服务器脚本或构建脚本。需要 Node.js、npm 和本机 Chrome 运行旧 CDP 检查，静态演示可用 Python 3。确切版本在执行时读取并记入原 Task，不把某次本机版本写成长期最低要求。

首次需要安装 Node 依赖时，在仓库根使用 `npm ci` 按锁文件安装；本次迁移复用现有 `node_modules`，没有重新安装依赖。`playwright-core` 不包含浏览器，旧脚本使用 `channel: "chrome"` 调用本机 Chrome。

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
