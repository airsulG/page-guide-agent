# AGENTS 导航

本文件保存当前项目每轮都必须进入上下文的运行背景。全局协作宪法、技能路由、Agent Loop、上下文工程和安全规则见：

```text
/Users/zhouqi/.codex/AGENTS.md
```

## 项目运行背景

- 项目一句话承诺：在任意网页上通过对话让本地 AI 理解页面结构并直接渲染分步指引；成果沉淀为本地任务文件，越用越准。来源：`.project/01-product/PRODUCT.md`。
- 目标用户：当前阶段为 Karl 本人；长期面向复杂 Web 工具的普通用户。来源：`.project/01-product/PRODUCT.md`。
- 核心价值：页面内即时指引替代离开页面查文档；会话内自愈，无人工维护配置。来源：`.project/01-product/PRODUCT.md`。
- 第一阶段成立标准：AI 对未配置过的复杂页面凭空产出 ≥5 条验证命中的注释指引并渲染（PRD 验收标准 1）。来源：`.project/01-product/page-guide-agent.md`。
- 不做事项：第一阶段不做 AI 自动点击；不做云端账号；不预置白名单或静态指引库；不做通用爬虫。来源：`.project/01-product/PRODUCT.md`。

## 产品承诺快照

本区只保存每轮 Agent 必须记住的产品承诺摘要，不替代完整产品文档。完整权威源是 `.project/01-product/PRODUCT.md`；如果本区和 PRODUCT 冲突，以 PRODUCT 为准，并同步修正本区。

- 待补充。

## 当前模块入口

本区只保存当前正在推进的模块 PRD 路径；PRD 自身保存稳定模块事实、当前交付、已验收目标证据和长期踩坑点。

- 当前模块 PRD：`.project/01-product/page-guide-agent.md`（页面指引 Agent 核心能力模块；需求定义完成，实现未开始）

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

## 更新规则

- Karl 确认 PRODUCT 长期规则后，检查本文件的产品承诺快照是否需要同步。
- Karl 开始、切换或完成一个模块后，检查本文件的当前模块 PRD 入口是否需要同步。
- 只同步运行时必须记住的摘要，不把 PRODUCT 或模块 PRD 全文复制进来。
