# .project 目录说明

这个目录以产品总纲与模块 PRD 为中心保存长期产品事实、当前交付、验收结论和外部证据入口。

全局规则入口：
`/Users/zhouqi/.codex/AGENTS.md`

## 目录结构

```text
.project/
  00-index.md
    -> 产品总纲、模块 PRD 与显式例外的最小入口。

  01-product/
    -> PRODUCT.md 保存跨模块承诺；每个 <module>.md 是一个用户能力模块的唯一文档权威与默认工作入口。

  02-tasks/
    -> 保存尚未成熟为 PRD 的真实问题、由 PRD 产生的实现与验收工作，以及按需 PDOC / Loop Task；候选事实不自动成为产品权威。

  03-docs/
    -> 不频繁进入任务循环的长文档。

  04-artifacts/
    -> 截图、视频、日志、构建结果和其他大型原始证据；模块 PRD 只保留结论、链接和覆盖边界。

  05-prototypes/
    -> 可运行探索与视觉验证材料，不是模块事实权威源。
```

## 使用规则

1. 新会话先读项目根 `AGENTS.md`。
2. 读取 `.project/00-index.md` 找到产品总纲、当前模块 PRD 或显式独立任务入口。
3. 读取 `.project/01-product/PRODUCT.md` 了解长期产品规则。
4. 完整读取当前模块 PRD；产品、设计、视觉、架构、实现和 QA 的长期结论由当前专业 owner 直接写回同一文件。
5. 原型与大型证据放在外部目录，PRD 只记录会改变后续判断的结论、定位链接和覆盖边界。
6. 真实问题尚未成熟为 PRD，或 PRD 产生了需要持续推进的实现、验收和迁移工作时，进入 `.project/02-tasks/`；Task 关闭时写清哪些结论晋升、哪些不晋升。

真实创建缺失文件时进入 `karl-workspace-init`；模块工作由 Codex Agent 从 PRODUCT 与当前 PRD 恢复，并根据最大真实缺口直接选择产品、设计、视觉、架构、实现或 QA Skill；当前专业 owner 直接更新同一 PRD。只有要改变这套机制本身时才进入 `karl-system-harness`。

周期性独立报告自动化不是默认项目骨架。只有 Karl 明确要把某个 Codex automation 入库时，才由当前会话调用可用 automation 工具，并按项目文档写入规则记录对应目录和报告。

不要新建旧式 `.project/EARS/` 或 `.project/tasks/`。旧式 `.project/PRODUCT.md`、`.project/design/`、`.project/design-model/`、`.project/03-product-design/02-user-task-flows/`、`.project/03-product-slices/`、`.project/03-feature-flow/`、`.project/04-interface-model/`、`.project/agent-loop/` 只作为 legacy 迁移来源。
