# 架构与当前实现

产品的已确认方向见 [产品总纲](01-PRODUCT.md)和[模块规格](modules/page-guide-agent.md)。本文件说明源码当前职责与新方向的技术缺口，不指定尚未验证的标注 API。

## 现有 Chrome 原型

| 部分 | 当前职责与入口 | 使用限制 |
|---|---|---|
| Side Panel | `prototype/extension/sidepanel.js` 发现旧 guide 任务并发送播放、推进和停止指令 | 这是历史播放器，独立前端已退出产品方向 |
| 页面内容脚本 | `prototype/extension/content.js` 消费 guide 步骤，定位、渲染、完成判定和旧 Lesson | 旧兼容合同见 [LEARN03 合同](</Users/zhouqi/.codex/skills/LEARN/LEARN03-生成网页任务指引/references/guide-schema.md>)；不是新通信协议 |
| 扩展配置与后台 | `prototype/extension/manifest.json`、`background.js` 登记权限、内容脚本与侧栏行为 | 现有 Chrome 安装不证明 Codex 内置浏览器可运行 |
| 本地任务包 | `prototype/service/tasks/index.json` 与每个任务的 `guide.json` | 当前侧栏以 main 的绝对 file URL 读此目录；不是工程工作任务 |
| CDP 验证脚本 | `prototype/cdp/t1-connect.js` 至 `t7-phase2-walkthrough.js` | 启动独立 Chrome，脚本可改写 samples 或 guide；证据范围见原 Task |
| 当前方法 | 通用 LEARN02/03 负责对话内网页理解与标注方法 | 项目 `skill/` 和 `prototype/skill/` 只作历史参考 |

旧播放通常由侧栏读取任务目录，再向标签页内容脚本发送消息。代码保留 completion 与 lesson 的兼容行为；这一调用过程及本地格式不决定新产品必须如何使用。旧任务包、CDP 样本和原 Task 的身份保持不变，文档迁移不搬程序目录。

## 新体验的职责与缺口

已接受的分工是：Codex 对话理解问题并解释，内置浏览器呈现网页供用户操作，插件提供定位、绘制、更新、撤下和结果反馈，本地资料支持必要接续。每次指示必须核对当前网页与真实目标；观察到页面变化后再继续。

内置浏览器的扩展安装或注入、命令与结果传递、会话与标签页归属、持续更新和清理均尚未验证。当前没有已接受的新消息名、JSON schema 或通信实现。后续先调查真实可用工具，再在 [模块规格](modules/page-guide-agent.md) 的要求下确定接口；不能直接把旧 PGA_PLAY 当成新能力已实现。

官方扩展开发 Skill 已安装，DevTools MCP 已启用扩展管理工具并完成工具发现检查。这些属于开发环境能力，没有建立 Codex 对话与内置浏览器插件之间的命令通道。内置浏览器的扩展管理页被自动化 URL 策略拦截，实际加载需 Karl 手动操作；后续在 HTTP/HTTPS 页面验证内容脚本与通信。开发工具用法见 [开发说明](04-DEVELOPMENT.md)，实际证据见 [Task 06](../.TASK/06-extension-development-tools.md)。

## 文档、任务与证据

长期规则在 `.PROJECT/`，核心判断在根 EVAL，工作任务在 `.TASK/`；`prototype/service/tasks/` 只保存旧产品的 guide 资产。二者不能相互替代，也不把工程进度写入 guide 文件。

已有软件说明演示和本次方法检查材料在 `.PROTOTYPE/`，原 CDP 脚本产物仍在 `prototype/cdp/samples/`。团队独立工作树的运行方法、领取与会话登记仍由其 `.TEAM/` 维护；main 只保存建设定义与查阅入口，见 [Task 03](../.TASK/03-project-team.md)。
