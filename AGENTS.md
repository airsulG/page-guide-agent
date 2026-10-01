# AGENTS 导航

本文件保存当前项目每轮都必须进入上下文的运行背景。全局协作宪法、技能路由、Agent Loop、上下文工程和安全规则见：

```text
/Users/zhouqi/.codex/AGENTS.md
```

## 项目运行背景

- 项目一句话承诺：让 Codex 在与你共同使用网页时，能够直接在页面上指给你看，并根据你的问题和操作结果持续调整帮助。来源：`.PROJECT/01-PRODUCT.md`。
- 目标用户：当前阶段为 Karl 本人；长期面向复杂 Web 工具的普通用户。来源：`.PROJECT/01-PRODUCT.md`。
- 核心价值：在 Codex 中共同观察、讨论和操作网页，解释准确对应真实对象，帮助随多轮对话继续。来源：`.PROJECT/01-PRODUCT.md`。
- 当前成立标准：真实内置浏览器中完成提问、标注、用户操作、重新观察、更新与撤下；不要求先生成完整教程。来源：`.PROJECT/modules/page-guide-agent.md` 的当前产品验收。
- 不做事项：独立插件侧栏、任务列表、教程播放器、知识卡或内容预览页；云端账号、静态网站教程库和通用爬虫。标注权限不包含自动点击或业务写入。来源：`.PROJECT/01-PRODUCT.md`。

## 产品承诺快照

本区只保存每轮 Agent 必须记住的产品承诺摘要，不替代完整产品文档。完整权威源是 `.PROJECT/01-PRODUCT.md`；如果本区和 PRODUCT 冲突，以 PRODUCT 为准，并同步修正本区。

- Codex 对话是唯一使用入口，主要场景是对话、内置浏览器、用户操作与即时标注共同发生；局部提问不必先变成完整任务。
- 插件没有独立产品前端，只提供预先定义的定位、绘制、更新、撤下与结果反馈能力；内容与下一次指示由当前对话决定。
- 完整解释、知识、Mermaid 与图片留在对话，使用当前可用工具；页面只有指向真实对象的标注和必要短提示。
- 支持范围由实际浏览器观察与注入能力决定。0.2.0 已在内置浏览器用真实 MCP SDK 完成批量标注、更新、清理与开发自动更新，也在官方文档页绘制并撤下；当前原生会话工具发现和复杂网页多轮体验仍待验证，证据见 Task 07。
- 本地资料帮助后续对话接续和复用；旧 guide.json、任务索引、Side Panel 与 Lesson 是历史合同。当前扩展输出已改为 MCP 标注，无侧栏声明，真实验收见 Task 07。

## 当前模块入口

本区只保存当前正在推进的模块 PRD 路径；PRD 自身保存稳定模块事实、当前交付、已验收目标证据和长期踩坑点。

- 当前模块 PRD：`.PROJECT/modules/page-guide-agent.md`（对话驱动、无独立插件前端；MCP 与开发更新已实现并通过真实扩展检查，完整多轮体验仍需验收）。
- 2026-10-02 已授权 MCP 标注与开发自动更新，计划和真实验证记录见 `.TASK/07-mcp-page-annotations.md`；产品定义与旧兼容证据分别见 Task 04、06。

## TEAM 入口

设计、创建或接续自主团队时，读取 [团队定义与建设任务](.TASK/03-project-team.md)。控制工作树已由建设对话创建于 `/Users/zhouqi/.codex/worktrees/page-guide-team/51-page-guide-agent`，实际运行进展仍查其旧位置的 [控制目录 Task 03](</Users/zhouqi/.codex/worktrees/page-guide-team/51-page-guide-agent/.project/02-tasks/03-project-team.md>)；main 的文件用于定义与导航，不从此副本领取。普通问答不自动启动团队，定时运行尚未开启。

团队目标是从完整体验选择新能力，在隔离分支自主开发并报告；候选不自动改写已接受产品承诺。Leader、产品与体验、工程各用独立持续会话，Karl 与 Leader 对接；Leader 管理会话、心跳、能力与定向工作消息，不切换身份代做业务岗位。会话独立，共享工作树写入仍排他。当前 Leader 会话为 `01a0f6fc-4dc6-78a1-ac0b-cf3c37c23a75`，岗位会话由它实际创建登记。候选插件须核对加载目录与任务来源，不能在 TEAM 工作树测试时仍读取 main 的任务包。

2026-10-01 的产品新方向已写入 main 定义；TEAM 控制工作树是否接续本次版本尚未核对。Leader 接续时先同步 PRODUCT、PRD 与职责方法，不继续按独立播放器、知识卡或内容预览页选新功能。本轮未修改运行工作树，也未发送其他会话消息。

## 禁止漂移项

- 不要在没有确认产品规则时替 Karl 补产品方向。
- 不要把临时原型、候选视觉或未确认偏好写成 accepted 产品 / 设计事实。
- 不要让代码实现反向决定产品承诺、页面规则或视觉规范。

## 会话开始先读

1. `/Users/zhouqi/.codex/AGENTS.md`
2. 本文件的项目运行背景、产品承诺快照、当前模块入口和禁止漂移项。
3. `.PROJECT/00-INDEX.md`
4. `.PROJECT/01-PRODUCT.md`
5. 当前模块 PRD；只有明确继续 Task 时才读取 `.TASK/00-INDEX.md` 与对应文件

## 工作区导航

```text
AGENTS.md                         执行约定与阅读入口
README.md                         项目介绍、当前可用内容与快速开始
EVAL.md                           已确认的核心结果标准
.PROJECT/
  00-INDEX.md                     长期文档索引
  01-PRODUCT.md                   产品承诺、愿景与最终体验
  02-ARCHITECTURE.md              MCP、扩展、构建与历史原型职责
  04-DEVELOPMENT.md               环境、运行、检查与生成文件说明
  modules/page-guide-agent.md     模块行为、详细验收与历史原型证据
.TASK/
  00-INDEX.md                     本地任务查找入口
  <编号>-<主题>.md                 同一任务的授权、过程、结果与接续
.PROTOTYPE/
  surface-tutorials/              既有软件说明演示与原始观察
  validation/                    既有方法验证截图、图形与报告
  legacy-workspace/               冻结的旧目录说明，不作当前依据
src/、scripts/、test/             当前 MCP 和扩展源码、构建与检查
prototype/extension/             已加载开发版的生成文件；旧 sidepanel 不再引用
prototype/cdp/、service/          历史脚本与任务包
skill/                           历史 Skill 镜像，当前方法仍用 LEARN02/03
package.json、package-lock.json   锁定依赖与 test、guide:dev/build/mcp/call/serve
```

长期正文只在 `.PROJECT/` 维护；任务沿用本地 Markdown，编号不变，每项只维护 `.TASK/` 中的一个文件。已有演示与验证材料在 `.PROTOTYPE/` 保存，执行者在新增或变更材料时更新引用；不要把任务、报告或缓存塞进长期规则目录。原型源码仍在 `prototype/`，路径受已安装插件和旧脚本依赖，本次没有移动。

日常工作按 [PROJECT06 的项目开发流程](</Users/zhouqi/.codex/skills/PROJECT/PROJECT06-推进项目开发/workflows/01-project-development-workflow.md>) 推进，读取本次适用的 [EVAL](EVAL.md)、模块规格和原 Task。修改运行或检查方法前读 [开发说明](.PROJECT/04-DEVELOPMENT.md)，修改模块与通信职责前读 [架构说明](.PROJECT/02-ARCHITECTURE.md)。执行者同批更新受影响正文、原任务与证据引用。

当前 main 的普通文档维护在本地保存，验证后只提交本次内容；本仓库没有远端，不创建 Issue、PR 或推送。TEAM 仍使用它已有的隔离分支与控制工作树，具体范围见 Task 03；不能从 main 切换或覆盖其运行状态。插件安装、代码整合和发布不由文档迁移授权。

## 开发时自动更新扩展

开发更新按下面的流程运行，不要求使用 Plasmo。实现入口见 `.PROJECT/04-DEVELOPMENT.md`；内置浏览器真实检查状态以 Task 07 为准。

1. **监听源码并准备新文件。** 开发服务监听变化，把检查通过的文件写入已加载的开发版扩展目录。普通 JS 可以直接准备文件，使用 TS 后再接编译；全部文件准备成功后才通知扩展，失败时保留上一版，不触发重载。
2. **通知扩展重新加载。** 开发版后台通过本机 WebSocket 接收更新通知，保存本次指定的测试标签页，再调用 `chrome.runtime.reload()`。
3. **让测试页加载新代码。** 扩展重载后，由新后台读取待刷新标签页，调用 `chrome.tabs.reload(tabId)`，随后恢复与开发服务的连接。只刷新指定测试页，不默认刷新当前活动页或所有标签页。

第一次加载开发版扩展需要我手动操作。给现有旧版加入监听逻辑后，也需要我再手动重载一次，让新逻辑开始运行；此后开发服务持续运行时，源码修改、扩展重载和测试页刷新应自动完成。监听与自动刷新只放在开发版，正式使用时不启用。

这套流程免去的是手动刷新，网页本身仍会刷新，未保存的输入可能丢失，所以先用专门的测试页。页面不刷新且保留输入、滚动状态的局部热更新另行确定，不记成这套流程已经提供的能力。

验收时修改一处标注颜色并保存源码，确认内置浏览器中的真实扩展自动更新、指定测试页自动刷新并显示新颜色，其他标签页保持原样；记录实际加载目录、版本与结果。

<!-- ACTIVE_TASK_START -->
最近完成 MCP 与开发更新，见 `.TASK/07-mcp-page-annotations.md`。Semrush 实际教学提出编号标注点击展开详细注解，方案见 `.TASK/08-expandable-annotation-details.md`，当前待 Karl 确认；交互尚未实现。TEAM 运行任务仍在独立控制工作树。
<!-- ACTIVE_TASK_END -->

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
