---
name: page-guide-skill
description: 用于为任意网页生成可验证、可持久化、可在 Chrome 插件中播放的任务指引。当 Karl 指定一个网页并提出「生成指引 / 教我怎么用这个页面 / 做一个页面任务向导」，或要求为现有任务补充步骤、知识卡（lesson）、完成判定（completion）时使用。生成产物是符合 guide.json 合同的任务文件夹；不做与页面指引无关的通用爬虫、数据提取或自动代操作。
---

# Page Guide Skill

把「在某个网页上完成某件事」变成一份可执行、可验证、可复用的任务指引：每一步指向真实页面元素、带三层注释、定义完成判定，需要时挂上知识卡。产物写入项目的任务目录，由 Page Guide Agent Chrome 插件加载播放。

## 输入与前置事实

开始前确认三件事，缺哪项补哪项：

1. **目标页面**：URL（或本地 HTML）。真实页面用 playwright-core 以 `channel: "chrome"` 连接用户 Chrome 观察结构（参考 `references/observation-recipe.md`）；无法联网时向 Karl 要页面快照。
2. **任务意图**：用户要在这页完成什么。一句话说不清就先和 Karl 对齐任务边界，再动手。
3. **任务目录**：默认 `<project>/prototype/service/tasks/<task-slug>/guide.json`，并保证目录 `index.json` 里有对应条目；Karl 指定其他位置时遵循指定。

## 生成流程

1. **先扫骨架，再下钻。** 用标题、分区、 landmark 把页面组织成「区块 → 控件」层级；裸控件列表没有语义，禁止直接生成注释。
2. **选值得注释的元素。** 覆盖任务必经入口、含义不自明的控件、易误用开关、列表主操作；跳过装饰和重复项。步骤数以任务自然节奏为准，不凑数量。
3. **定位策略抗失效。** 优先级：stable text > placeholder/aria > 结构 CSS。每个元素给 primary + fallback 两个定位；text 定位必须确认唯一性，避免误命中同名元素。
4. **注释写三层**：这个元素是什么；在当前任务里怎么用；与相邻项的关系。禁止只复述控件名。
5. **定义完成判定。** 每步判断：用户完成后什么信号能被检测？可检测就写 `completion`（`input` / `click` / `check`，input 可加 `valueContains`）；不可稳定检测就省略 completion，让插件回退「下一步」手动推进。永远不要为凑自动化写检测不了的信号。
6. **需要知识深度时挂 lesson。** 概念解释、参数对比、易错点写成 `lesson.blocks`（`text` / `list` / `tip`）；气泡注释保持一句话，深度内容放 lesson，不要把气泡写成段落。
7. **逐条验证后交付。** 渲染或交付前，每条选择器在真实页面验证命中；未命中重新观察修正，禁止把推测写给用户。验证通过的产物写回任务文件夹并更新 index.json。

## 失败语义

- 选择器失效且 Agent 能重新定位：修复后写回任务文件（revisionLog 记录），这是常态迭代。
- 无法修复：在 guide.json 里保留该步骤并说明；插件会显性显示「指引过期」，不沉默、不错误指向。
- 页面整体改版导致 URL 或地标不匹配：提示 Karl 任务绑定需要重建，不要静默生成一份和页面无关的指引。

## 产物合同

guide.json 完整 schema、字段示例和 lesson.blocks 类型见 `references/guide-schema.md`。生成任何任务文件前先读它；schema 演进由本 Skill 维护，插件（`prototype/extension/content.js`）是它的真实消费者，改 schema 前先确认插件能消费新字段。
