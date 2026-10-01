# AGENTS 导航

本文件保存当前项目每轮都必须进入上下文的运行背景。全局协作宪法、技能路由、Agent Loop、上下文工程和安全规则见：

```text
/Users/zhouqi/.codex/AGENTS.md
```

## 项目运行背景

- 项目一句话承诺：在任意网页上通过对话让本地 AI 理解页面结构并直接渲染分步指引；成果沉淀为本地任务文件，越用越准。来源：`.project/01-product/PRODUCT.md`。
- 目标用户：当前阶段为 Karl 本人；长期面向复杂 Web 工具的普通用户。来源：`.project/01-product/PRODUCT.md`。
- 核心价值：页面内即时指引替代离开页面查文档；会话内自愈，无人工维护配置。来源：`.project/01-product/PRODUCT.md`。
- 第一阶段成立标准：AI 能对未配置过的复杂页面产出覆盖当前任务所需关键元素、且经验证命中的注释指引并渲染；具体覆盖数量由任务决定，不预设固定数字。来源：`.project/01-product/page-guide-agent.md`。
- 不做事项：第一阶段不做 AI 自动点击；不做云端账号；不预置白名单或静态指引库；不做通用爬虫。来源：`.project/01-product/PRODUCT.md`。

## 产品承诺快照

本区只保存每轮 Agent 必须记住的产品承诺摘要，不替代完整产品文档。完整权威源是 `.project/01-product/PRODUCT.md`；如果本区和 PRODUCT 冲突，以 PRODUCT 为准，并同步修正本区。

- 产品不是预置网页教程库，而是 AI 在每次会话里通过 CDP 观察、生成、验证、修复指引的运行系统。
- 产品由 Chrome Side Panel 插件、AI Agent + 指引 Skill、本地任务目录共同组成；任务以「一任务一文件夹 + 索引」持久化，插件直读本地目录。
- 支持范围不按网站名单限制；能力边界是浏览器和 CDP 实际可观察、可注入的页面。
- 第一阶段先证明网页结构可以被可靠识别并转成正确的页面注释；第二阶段再加入任务步骤推进和用户交互反馈。
- 第二阶段核心方向：步骤完成判定、交互反馈回路，以及 Step+Lesson 知识体系（每步可展开知识卡，在侧边栏阅读）。

## 当前模块入口

本区只保存当前正在推进的模块 PRD 路径；PRD 自身保存稳定模块事实、当前交付、已验收目标证据和长期踩坑点。

- 当前模块 PRD：`.project/01-product/page-guide-agent.md`（第一阶段原型已验收；第二阶段已有完成判定与 Lesson 实现，真实插件人工验收未完成）。

## TEAM 入口

设计、创建或接续自主团队时，读取 [团队定义与建设任务](.project/02-tasks/03-project-team.md)。当前只有方案，尚未建立 `.TEAM` 控制工作树或定时运行。普通问答不自动启动团队。

团队目标是从完整体验选择新能力，在隔离分支自主开发并报告；候选不自动改写已接受产品承诺。创建后由执行者在本区登记真实控制目录与入口。候选插件必须核对实际加载目录与任务来源，不能在 TEAM 工作树测试时仍读取 main 的任务包。

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

当前页面任务发现使用 [LEARN02](</Users/zhouqi/.codex/skills/LEARN/LEARN02-发现网页中的可完成任务/SKILL.md>)，指引生成使用 [LEARN03](</Users/zhouqi/.codex/skills/LEARN/LEARN03-生成网页任务指引/SKILL.md>)，合同见其 `references/guide-schema.md`。旧扩展目录的 SKILL.md 已不存在；项目 `skill/` 与 `prototype/skill/page-guide-skill.md` 保留为历史参考，不作为运行入口。

- **保持最新**：插件能力（`prototype/extension/content.js` 消费的 guide.json 字段、completion 判定类型、lesson.blocks 结构）发生变化时，核对 LEARN03 的 `references/guide-schema.md` 与生成流程；有全局 Skill 维护授权时同批更新，否则保存准确的合同变化交接。
- **同步触发点**：修改 content.js 的字段消费、新增 completion 类型、调整 lesson 渲染、改变任务目录结构时，必须检查当前方法并记录必要变更；PRD 新增 R 编号需求涉及指引产物格式时同样处理。全局方法的实际修改遵守上一项授权范围。
- **验证要求**：更新后在真实页面生成或修复一次任务作为回归证据；schema 改动必须运行 `quick_validate.py` 确认 Skill 结构合法。
- TEAM 候选阶段的本地消费合同与检查结果保存在角色方法和原 Task，不复制通用 Skill 正文，不自行改写全局方法。

## 更新规则

- Karl 确认 PRODUCT 长期规则后，检查本文件的产品承诺快照是否需要同步。
- Karl 开始、切换或完成一个模块后，检查本文件的当前模块 PRD 入口是否需要同步。
- 修改插件消费合同（content.js / guide.json schema）后，检查 Skill 维护职责区是否需要同步更新。
- 只同步运行时必须记住的摘要，不把 PRODUCT 或模块 PRD 全文复制进来。
