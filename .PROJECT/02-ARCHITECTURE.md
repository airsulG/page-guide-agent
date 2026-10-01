# 架构与当前实现

产品方向见 [产品总纲](01-PRODUCT.md)和[模块规格](modules/page-guide-agent.md)。本文件说明 MCP 标注实现与历史材料的职责，实际验收状态见 [Task 07](../.TASK/07-mcp-page-annotations.md)。

## 对话到页面的实际实现

Codex 使用 stdio MCP 适配器；适配器把校验过的参数发送到本机桥接服务。扩展后台主动连接桥接，再把指令送给指定标签页的内容脚本。内容脚本只定位、绘制和返回结果，不点击或填写业务网页。MCP 是调用方式，参数仍使用 JSON；没有预先播放的教程文件。

| 文件 | 负责什么 |
|---|---|
| `src/contract.mjs` | 六项工具 schema、默认值、数组限制与页面句柄；适配器和桥接都校验参数 |
| `src/mcp.mjs` | SDK stdio 初始化、工具发现和调用，把页面错误返回 `isError` |
| `src/bridge.mjs` | 只监听 127.0.0.1，校验本机密钥、Host 与扩展 Origin，关联请求、超时和断开 |
| `src/extension/background.js` | 浏览器实例身份、页面枚举、消息转发、WebSocket 心跳与 alarms 重连 |
| `src/extension/content.js` | 唯一目标检查、同批绘制、更新、清理，以及布局变化后的重新定位 |
| `src/extension/dev-reload.js` | 仅开发版：接版本通知、保存测试页、重载扩展、刷新并恢复测试标注 |
| `scripts/build.mjs`、`dev.mjs` | 完整校验后生成文件；开发监听成功版本，正式服务不监听或自动刷新 |

精确合同和示例见 [MCP 标注协议](protocols/mcp-annotations.md)。`page_id` 绑定实例、tab、文档 UUID 和 URL；跳转、重载或断开后重新取得句柄，在途请求不自动重放。`session_id` 由调用方使用当前会话 ID 提供，默认只清理该组；它防止误清理，不是多用户权限系统。

一批最多 20 项，所有新目标唯一且可见才修改；不存在、不唯一或错误范围会返回错误并保留旧批次。位置由真实边界和偏移计算，短提示在视口边缘收回。滚动、尺寸或 DOM 变化后重新定位，目标失效则撤下并在状态中报告。支持明确指定的同源 iframe 与开放 Shadow DOM；跨源和关闭的范围拒绝处理。

当前指引使用带 number 的 connector：text 只写对象名称，编号贴近对象，用无箭头线段连接名称，全部常驻；每项 color 可自定义，统一用于线段、名称背景与编号，多色分类含义留在对话。覆盖层不接收鼠标事件，不添加目标悬停或焦点监听，不修改原控件属性，也不绘制目标框或淡色覆盖。刷新时重新定位，更新或撤下时清理节点。旧 marker、高亮与未编号箭头等继续兼容；详见协议与 Task 08。

本机连接信息在 `.page-guide/connection.json`，生成的 `config.js` 含密钥，两者都忽略，不提交。产品 WebSocket 与重连保留在正式版；源码监听、`runtime.reload()`、测试页快照与恢复只在开发版启用。正式产物使用 `build/extension/`，开发产物继续使用已加载的 `prototype/extension/`。

## 现有 Chrome 原型

| 部分 | 当前职责与入口 | 使用限制 |
|---|---|---|
| Side Panel | `prototype/extension/sidepanel.js` 发现旧 guide 任务并发送播放、推进和停止指令 | 这是历史播放器，独立前端已退出产品方向 |
| 历史内容脚本 | 0.1.0 消费 guide、completion 与 Lesson；版本保存在 Git 历史 | 同路径的当前文件已由 MCP 源码生成，不再播放 guide |
| 当前扩展目录 | `prototype/extension/manifest.json`、`background.js`、`content.js` 是构建输出 | manifest 已撤掉侧栏和 file 访问，旧 sidepanel 文件保留但不引用 |
| 本地任务包 | `prototype/service/tasks/index.json` 与每个任务的 `guide.json` | 旧侧栏曾通过 file URL 读取；当前 MCP 不读取，不是工程工作任务 |
| CDP 验证脚本 | `prototype/cdp/t1-connect.js` 至 `t7-phase2-walkthrough.js` | 启动独立 Chrome，脚本可改写 samples 或 guide；证据范围见原 Task |
| 当前方法 | 通用 WEBTASK01/02 负责从最终产物反推问题、编排工具与调查路径、跨工具产物交接及对话引导，标注辅助定位 | 项目 `skill/` 和 `prototype/skill/` 只作历史参考 |

旧播放由侧栏读取任务目录，再向内容脚本发消息。旧任务包、CDP 样本和原 Task 保留；旧 CDP 脚本依赖旧代码，不能证明新 MCP 标注通过。追溯旧实现时读取 Git 版本，不覆盖当前加载目录。

## 新体验的职责与缺口

已接受的分工是：Codex 对话理解需求、编排工具分工与路径步骤、交接中间产物并讲解当前操作，内置浏览器呈现网页供用户登录和操作，插件提供定位、绘制、更新、撤下和结果反馈，本地资料支持必要接续。阶段与完成条件由 AI 在对话中规划，插件没有规划或业务操作能力。每次指示核对当前网页与真实目标，操作后对照预期结果再继续；当前标注通道通过不等于两条目标路径已验收。

旧扩展真实绘制证据见 Task 06。本次实际安装的 0.2.0 已通过真实 SDK 调用和内置浏览器观察，结果在 Task 07；自动检查另验证协议、错误行为、frame 限制和开发恢复。原生 Codex 工具发现与复杂网页多轮体验尚需检查。

官方扩展开发 Skill 已安装，DevTools MCP 已启用扩展管理工具并完成工具发现检查。这些属于开发环境能力；当前命令通道由本项目 MCP 与配对扩展提供。自动化 URL 策略禁止打开扩展管理页，Karl 已手动加载并完成新后台首次重载。开发工具用法见 [开发说明](04-DEVELOPMENT.md)，实际证据见 Task 06、07。

## 文档、任务与证据

长期规则在 `.PROJECT/`，核心判断在根 EVAL，工作任务在 `.TASK/`；`prototype/service/tasks/` 只保存旧产品的 guide 资产。二者不能相互替代，也不把工程进度写入 guide 文件。

已有软件说明演示和本次方法检查材料在 `.PROTOTYPE/`，原 CDP 脚本产物仍在 `prototype/cdp/samples/`。团队独立工作树的运行方法、领取与会话登记仍由其 `.TEAM/` 维护；main 只保存建设定义与查阅入口，见 [Task 03](../.TASK/03-project-team.md)。
