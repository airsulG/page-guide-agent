# AGENTS 导航

全量已注册组件悬停可显示就近深色磨砂说明卡；对话指向的组件同样可悬停查看。对话指向增加按当前顺序排列的编号，选择本身只显示框选与角标，不展开常驻卡。页面始终最多显示当前悬停对象的一张说明卡，移开后收起；默认无标注，复制组件 ID 保留。完整入口、检查及接续见[四项工作流](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/annotation-workflows.md>).

本文件保存当前项目每轮都必须进入上下文的运行背景。全局协作宪法、技能路由、Agent Loop、上下文工程和安全规则见：

```text
/Users/zhouqi/.codex/AGENTS.md
```

## 项目运行背景

- 项目一句话承诺：让 Codex 理解你的目标，编排工具、调查路径和步骤，在对话中带你取得并串联各工具的结果，直到完成目标。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`。
- 目标用户：当前阶段为 Karl 本人；长期面向复杂 Web 工具的普通用户。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`。
- 核心价值：从最终产物反推问题，编排工具分工、路径、步骤及产物交接，在对话中解释、检查结果并调整方案；标注辅助找到对象。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`。
- 只有大概兴趣时，由 Codex 主动提出可调整的探索起点、有限成果与成功标准，带用户取得具体材料后再明确方向；不先要求填写市场、领域或策略问卷。标注围绕当前操作及核对依据，按阶段替换清理。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md` 与 WEBTASK01/02。
- 当前成立标准：从需求形成可执行的工具编排与路径，再在内置浏览器取得并交接真实产物，根据发现调整方案、完成目标；必要登录与组件讲解服务于本步，标注辅助定位。两条完整路径仍待真实任务验收。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/modules/page-guide-agent.md` 的当前产品验收。
- 不做事项：独立插件侧栏、任务列表、独立知识阅读页、预设路径、浮动教程与路径切换窗；云端账号、静态网站教程库和通用爬虫。讲解与行动顺序由对话模型组织，标注权限不包含自动点击或业务写入。来源：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`。

## 产品承诺快照

- 网页只显示完整组件橙黄框和数字角标，不展开常驻正文卡片或连线；完整解读在对话，用相同编号对应。hover显示框选、唯一就近说明卡及复制图标，移开隐藏；非选中hover不分配对话编号。

- 体验方向为全量悬停知识与对话精确选择。讲解、顺序与目标检查由对话模型负责，插件不提供预设路径或切换窗；方向调整原因见 PRODUCT 2.1。

- page_guide_show接收component_ids，mode为replace（默认）、add或remove，追加去重，最终最多40项。空数组替换撤下显示，知识保留。返回number/title/body及outline_visible/badge_visible，供对话核对编号和实际可见状态。

本区只保存每轮 Agent 必须记住的产品承诺摘要，不替代完整产品文档。完整权威源是 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`；如果本区和 PRODUCT 冲突，以 PRODUCT 为准，并同步修正本区。

- Codex 对话是唯一使用入口，主要场景是对话、内置浏览器、用户操作与即时标注共同发生；局部提问不必先变成完整任务。
- 核心是编排工具完成目标。工具选择必须带有调查路径、具体步骤、输入输出交接和完成判断；不能停在工具名单或阶段标题。参照 WEBTASK 的 SEO 找词建站贯穿案例理解做法，按真实需求调整数量和顺序。跨工具的发现回到同一目标；标注最次要。
- 默认从需求与目标开始，不逐项介绍界面。参考网址先判断用途，再按所需能力选择工具；在内置浏览器进入选定网站，必要时请 Karl 自行登录并重新观察。先规划阶段、环节与当前步骤，再对应到真实组件，讲清目的、操作理由和预期结果；操作后按实际结果继续或调整。局部问题仍直接回答。
- 插件提供整页悬停说明及对话选择的标注显示，不提供路径窗或教程。内容与下一次选择由当前对话决定。
- 2026-10-12当前要求：知识有知识增量和行家感，深入解读在对话。选择常驻框＋数字，hover显示唯一附近说明卡和复制；视口外隐藏恢复。旧connector保留兼容，不代用户操作业务。
- 支持范围由实际浏览器观察与注入能力决定。0.2.0 已在内置浏览器用真实 MCP SDK 完成批量标注、更新、清理与开发自动更新，也在官方文档页绘制并撤下；当前原生会话工具发现和复杂网页多轮体验仍待验证，证据见 Task 07。
- 本地资料帮助后续对话接续和复用；旧 guide.json、任务索引、Side Panel 与 Lesson 是历史合同。当前扩展输出已改为 MCP 标注，无侧栏声明，真实验收见 Task 07。

## 当前模块入口

本区只保存当前正在推进的模块 PRD 路径；PRD 自身保存稳定模块事实、当前交付、已验收目标证据和长期踩坑点。

- 当前模块 PRD：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/modules/page-guide-agent.md`（整页悬停与对话精确选择，保留对话编排；最新变更与真实检查见 Task 11）。
- 2026-10-02 已授权 MCP 标注与开发自动更新，计划和真实验证记录见 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/TASK/07-mcp-page-annotations.md`；产品定义与旧兼容证据分别见 Task 04、06。

## TEAM 入口

设计、创建或接续自主团队时，读取 [团队定义与建设任务](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/TASK/03-project-team.md>)。控制工作树已由建设对话创建于 `/Users/zhouqi/.codex/worktrees/page-guide-team/51-page-guide-agent`，实际运行进展仍查其旧位置的 [控制目录 Task 03](</Users/zhouqi/.codex/worktrees/page-guide-team/51-page-guide-agent/.project/02-tasks/03-project-team.md>)；main 的文件用于定义与导航，不从此副本领取。普通问答不自动启动团队，定时运行尚未开启。

团队目标是从完整体验选择新能力，在隔离分支自主开发并报告；候选不自动改写已接受产品承诺。Leader、产品与体验、工程各用独立持续会话，Karl 与 Leader 对接；Leader 管理会话、心跳、能力与定向工作消息，不切换身份代做业务岗位。会话独立，共享工作树写入仍排他。当前 Leader 会话为 `01a0f6fc-4dc6-78a1-ac0b-cf3c37c23a75`，岗位会话由它实际创建登记。候选插件须核对加载目录与任务来源，不能在 TEAM 工作树测试时仍读取 main 的任务包。

2026-10-01 的产品新方向已写入 main 定义；TEAM 控制工作树是否接续本次版本尚未核对。Leader 接续时先同步 PRODUCT、PRD 与职责方法，不继续按独立播放器、知识卡或内容预览页选新功能。本轮未修改运行工作树，也未发送其他会话消息。

## 禁止漂移项

- 不要在没有确认产品规则时替 Karl 补产品方向。
- 不要把临时原型、候选视觉或未确认偏好写成 accepted 产品 / 设计事实。
- 不要让代码实现反向决定产品承诺、页面规则或视觉规范。

## 会话开始先读

1. `/Users/zhouqi/.codex/AGENTS.md`
2. 本文件的项目运行背景、产品承诺快照、当前模块入口和禁止漂移项。
3. `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/00-INDEX.md`
4. `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/01-PRODUCT.md`
5. 当前模块 PRD；只有明确继续 Task 时才读取 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/TASK/00-INDEX.md` 与对应文件

## 工作区导航

```text
AGENTS.md                         执行约定与阅读入口
README.md                         项目介绍、当前可用内容与快速开始
```

对应资料：`/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/`。

```text
EVAL.md                           已确认的核心结果标准
00-INDEX.md                       长期文档索引
01-PRODUCT.md                     产品承诺、愿景与最终体验
02-ARCHITECTURE.md                MCP、扩展、构建与历史原型职责
04-DEVELOPMENT.md                 环境、运行、检查与生成文件说明
modules/page-guide-agent.md       模块行为、详细验收与历史原型证据
TASK/
  00-INDEX.md                     本地任务查找入口
  <编号>-<主题>.md                 同一任务的授权、过程、结果与接续
```

以下目录继续留在工程：

```text
.PROTOTYPE/
  surface-tutorials/              既有软件说明演示与原始观察
  validation/                    既有方法验证截图、图形与报告
  legacy-workspace/               冻结的旧目录说明，不作当前依据
src/、scripts/、test/             当前 MCP 和扩展源码、构建与检查
prototype/extension/             已加载开发版的生成文件；旧 sidepanel 不再引用
prototype/cdp/、service/          历史脚本与任务包
skill/                           历史 Skill 镜像，当前方法仍用 WEBTASK01/02
package.json、package-lock.json   锁定依赖与 test、guide:dev/build/mcp/call/serve
```

长期正文只在 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent` 维护；任务沿用本地 Markdown，编号不变，每项只维护 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/TASK/` 中的一个文件。已有演示与验证材料在 `.PROTOTYPE/` 保存，执行者在新增或变更材料时更新引用；不要把任务、报告或缓存塞进长期规则目录。原型源码仍在 `prototype/`，路径受已安装插件和旧脚本依赖，本次没有移动。

日常工作按 [PROJECT06 的项目开发流程](</Users/zhouqi/.codex/skills/PROJECT/PROJECT06-推进项目开发/workflows/01-project-development-workflow.md>) 推进，读取本次适用的 [EVAL](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/EVAL.md>)、模块规格和原 Task。修改运行或检查方法前读 [开发说明](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/04-DEVELOPMENT.md>)，修改模块与通信职责前读 [架构说明](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/02-ARCHITECTURE.md>)。执行者同批更新受影响正文、原任务与证据引用。

当前 main 的普通文档维护在本地保存，验证后只提交本次内容；本仓库没有远端，不创建 Issue、PR 或推送。TEAM 仍使用它已有的隔离分支与控制工作树，具体范围见 Task 03；不能从 main 切换或覆盖其运行状态。插件安装、代码整合和发布不由文档迁移授权。

## 开发时自动更新扩展

开发更新按下面的流程运行，不要求使用 Plasmo。实现入口见 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/04-DEVELOPMENT.md`；内置浏览器真实检查状态以 Task 07 为准。

1. **监听源码并准备新文件。** 开发服务监听变化，把检查通过的文件写入已加载的开发版扩展目录。普通 JS 可以直接准备文件，使用 TS 后再接编译；全部文件准备成功后才通知扩展，失败时保留上一版，不触发重载。
2. **通知扩展重新加载。** 开发版后台通过本机 WebSocket 接收更新通知，保存本次指定的测试标签页，再调用 `chrome.runtime.reload()`。
3. **让测试页加载新代码。** 扩展重载后，由新后台读取待刷新标签页，调用 `chrome.tabs.reload(tabId)`，随后恢复与开发服务的连接。只刷新指定测试页，不默认刷新当前活动页或所有标签页。

第一次加载开发版扩展需要我手动操作。给现有旧版加入监听逻辑后，也需要我再手动重载一次，让新逻辑开始运行；此后开发服务持续运行时，源码修改、扩展重载和测试页刷新应自动完成。监听与自动刷新只放在开发版，正式使用时不启用。

这套流程免去的是手动刷新，网页本身仍会刷新，未保存的输入可能丢失，所以先用专门的测试页。页面不刷新且保留输入、滚动状态的局部热更新另行确定，不记成这套流程已经提供的能力。

验收时修改一处标注颜色并保存源码，确认内置浏览器中的真实扩展自动更新、指定测试页自动刷新并显示新颜色，其他标签页保持原样；记录实际加载目录、版本与结果。

<!-- ACTIVE_TASK_START -->
当前体验记录在 `/Users/zhouqi/Desktop/项目资料/51-page-guide-agent/TASK/11-high-value-path.md`：网页只框选＋数字角标，对话用相同编号讲解；支持追加、替换和指定撤下。仅用Codex内置浏览器测试pump.fun，不访问Chrome。旧路径与卡片方案保留历史，TEAM工作树不改动。
<!-- ACTIVE_TASK_END -->

## Skill 维护职责

标注文案编写与审查先读 [.PROJECT/annotation-writing.md](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/annotation-writing.md>)：知识增量来自可使用的解释关系，保留市值、交易量、供应量占比完整对比案例。文案讨论稿与已运行版本分开，未知计算口径不补造。

当前需求理解与工具编排使用 [WEBTASK01](</Users/zhouqi/.codex/skills/WEBTASK/WEBTASK01-理解需求并选择工具/SKILL.md>)，跨工具路径执行、产物交接、对话讲解与辅助标注使用 [WEBTASK02](</Users/zhouqi/.codex/skills/WEBTASK/WEBTASK02-规划并引导网页任务/SKILL.md>)。`references/guide-schema.md` 只保存旧 Chrome 原型的兼容合同，不代表新通信 API。旧扩展目录的 SKILL.md 已不存在；项目 `skill/` 与 `prototype/skill/page-guide-skill.md` 仅作历史参考。

- **保持最新**：新标注命令、页面身份与目标定位、更新和清理、执行结果或操作反馈的实际合同变化时，同批核对 WEBTASK02 的方法与资源。有全局 Skill 维护授权时更新，否则保存准确交接；未实现接口不得先写成可调用事实。
- **同步触发点**：修改 content.js 消费字段、标注通信、完成反馈或本地保存办法时检查技能；旧 guide.json、completion、lesson 与目录只按兼容需要维护，不能反向恢复独立播放器方向。
- **验证要求**：按本次影响在真实页面检查一次标注方法；旧合同变化时生成或修复一次兼容任务。技能更新后运行 `quick_validate.py` 检查结构，区分内容脚本注入、真实插件与内置浏览器接入的证据。
- TEAM 候选阶段的本地消费合同与检查结果保存在角色方法和原 Task，不复制通用 Skill 正文，不自行改写全局方法。

## 更新规则

- Karl 确认 PRODUCT 长期规则后，检查本文件的产品承诺快照是否需要同步。
- Karl 开始、切换或完成一个模块后，检查本文件的当前模块 PRD 入口是否需要同步。
- 修改插件消费合同（content.js / guide.json schema）后，检查 Skill 维护职责区是否需要同步更新。
- 只同步运行时必须记住的摘要，不把 PRODUCT 或模块 PRD 全文复制进来。


## 对应项目资料入口

项目执行规则保留本文件。开始或接续工作实际读取[同层级项目资料索引](</Users/zhouqi/Desktop/项目资料/51-page-guide-agent/00-INDEX.md>)，再沿索引读取有关正文与原任务。两侧完整项目定位层级一致；资料侧不另建 AGENTS.md。已迁文件的旧位置与恢复依据记录在全量迁移任务中，运行依赖及未确认对象保留工程原位。
