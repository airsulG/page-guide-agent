# AGENTS 导航

本文件保存当前项目每轮都必须进入上下文的运行背景。全局协作宪法、技能路由、Agent Loop、上下文工程和安全规则见：

```text
/Users/zhouqi/.codex/AGENTS.md
```

## 项目运行背景

- 项目一句话承诺：让 Codex 在与你共同使用网页时，能够直接在页面上指给你看，并根据你的问题和操作结果持续调整帮助。来源：`.project/01-product/PRODUCT.md`。
- 目标用户：当前阶段为 Karl 本人；长期面向复杂 Web 工具的普通用户。来源：`.project/01-product/PRODUCT.md`。
- 核心价值：在 Codex 中共同观察、讨论和操作网页，解释准确对应真实对象，帮助随多轮对话继续。来源：`.project/01-product/PRODUCT.md`。
- 当前成立标准：真实内置浏览器中完成提问、标注、用户操作、重新观察、更新与撤下；不要求先生成完整教程。来源：`.project/01-product/page-guide-agent.md` 的当前产品验收。
- 不做事项：独立插件侧栏、任务列表、教程播放器、知识卡或内容预览页；云端账号、静态网站教程库和通用爬虫。标注权限不包含自动点击或业务写入。来源：`.project/01-product/PRODUCT.md`。

## 产品承诺快照

本区只保存每轮 Agent 必须记住的产品承诺摘要，不替代完整产品文档。完整权威源是 `.project/01-product/PRODUCT.md`；如果本区和 PRODUCT 冲突，以 PRODUCT 为准，并同步修正本区。

- Codex 对话是唯一使用入口，主要场景是对话、内置浏览器、用户操作与即时标注共同发生；局部提问不必先变成完整任务。
- 插件没有独立产品前端，只提供预先定义的定位、绘制、更新、撤下与结果反馈能力；内容与下一次指示由当前对话决定。
- 完整解释、知识、Mermaid 与图片留在对话，使用当前可用工具；页面只有指向真实对象的标注和必要短提示。
- 支持范围由实际浏览器观察与注入能力决定。内置浏览器能否运行现有 Chrome 扩展、怎样连接当前对话仍待验证，不以旧 Chrome 证据冒充。
- 本地资料帮助后续对话接续和复用；旧 guide.json、任务索引、Side Panel 与 Lesson 是历史原型合同，代码尚未迁移。

## 当前模块入口

本区只保存当前正在推进的模块 PRD 路径；PRD 自身保存稳定模块事实、当前交付、已验收目标证据和长期踩坑点。

- 当前模块 PRD：`.project/01-product/page-guide-agent.md`（已确认对话驱动、无独立插件前端；新运行体验未实现。旧原型证据保留）。
- 当前文档与技能维护记录：`.project/02-tasks/04-conversation-driven-annotations.md`；后续实现尚未授权，先验证内置浏览器安装、注入与通信条件。

## TEAM 入口

设计、创建或接续自主团队时，读取 [团队定义与建设任务](.project/02-tasks/03-project-team.md)。控制工作树已由建设对话创建于 `/Users/zhouqi/.codex/worktrees/page-guide-team/51-page-guide-agent`，实际运行进展查其中同一 Task；main 的文件用于定义与导航，不从此副本领取。普通问答不自动启动团队，定时运行尚未开启。

团队目标是从完整体验选择新能力，在隔离分支自主开发并报告；候选不自动改写已接受产品承诺。Leader、产品与体验、工程各用独立持续会话，Karl 与 Leader 对接；Leader 管理会话、心跳、能力与定向工作消息，不切换身份代做业务岗位。会话独立，共享工作树写入仍排他。当前 Leader 会话为 `01a0f6fc-4dc6-78a1-ac0b-cf3c37c23a75`，岗位会话由它实际创建登记。候选插件须核对加载目录与任务来源，不能在 TEAM 工作树测试时仍读取 main 的任务包。

2026-10-01 的产品新方向已写入 main 定义；TEAM 控制工作树是否接续本次版本尚未核对。Leader 接续时先同步 PRODUCT、PRD 与职责方法，不继续按独立播放器、知识卡或内容预览页选新功能。本轮未修改运行工作树，也未发送其他会话消息。

## 禁止漂移项

- 不要在没有确认产品规则时替 Karl 补产品方向。
- 不要把临时原型、候选视觉或未确认偏好写成 accepted 产品 / 设计事实。
- 不要让代码实现反向决定产品承诺、页面规则或视觉规范。

## 会话开始先读

1. `/Users/zhouqi/.codex/AGENTS.md`
2. 本文件的项目运行背景、产品承诺快照、当前模块入口和禁止漂移项。
3. `.project/00-index.md`
4. `.project/01-product/PRODUCT.md`
5. 当前模块 PRD；只有明确继续 Task 时才读取 `.project/02-tasks/00-index.md` 与对应文件

## 项目事实树

```text
.project/
  00-index.md
  01-product/PRODUCT.md
  01-product/<module>.md
  02-tasks/
  03-docs/
  04-artifacts/
  05-prototypes/
```

## Skill 维护职责

当前页面理解与任务发现使用 [LEARN02](</Users/zhouqi/.codex/skills/LEARN/LEARN02-发现网页中的可完成任务/SKILL.md>)，对话中的页面标注使用 [LEARN03](</Users/zhouqi/.codex/skills/LEARN/LEARN03-生成网页任务指引/SKILL.md>)。`references/guide-schema.md` 只保存旧 Chrome 原型的兼容合同，不代表新通信 API。旧扩展目录的 SKILL.md 已不存在；项目 `skill/` 与 `prototype/skill/page-guide-skill.md` 仅作历史参考。

- **保持最新**：新标注命令、页面身份与目标定位、更新和清理、执行结果或操作反馈的实际合同变化时，同批核对 LEARN03 的方法与资源。有全局 Skill 维护授权时更新，否则保存准确交接；未实现接口不得先写成可调用事实。
- **同步触发点**：修改 content.js 消费字段、标注通信、完成反馈或本地保存办法时检查技能；旧 guide.json、completion、lesson 与目录只按兼容需要维护，不能反向恢复独立播放器方向。
- **验证要求**：按本次影响在真实页面检查一次标注方法；旧合同变化时生成或修复一次兼容任务。技能更新后运行 `quick_validate.py` 检查结构，区分内容脚本注入、真实插件与内置浏览器接入的证据。
- TEAM 候选阶段的本地消费合同与检查结果保存在角色方法和原 Task，不复制通用 Skill 正文，不自行改写全局方法。

## 更新规则

- Karl 确认 PRODUCT 长期规则后，检查本文件的产品承诺快照是否需要同步。
- Karl 开始、切换或完成一个模块后，检查本文件的当前模块 PRD 入口是否需要同步。
- 修改插件消费合同（content.js / guide.json schema）后，检查 Skill 维护职责区是否需要同步更新。
- 只同步运行时必须记住的摘要，不把 PRODUCT 或模块 PRD 全文复制进来。
