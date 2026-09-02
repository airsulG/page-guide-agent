# Tasks Index

execution_mode: interactive

本文件只登记真实 Task 入口和最小恢复摘要，不写 Task 正文。尚未成熟为 PRD 的候选问题、由 PRD 产生的实现与验收工作，以及按需采用的 PDOC / Loop Task 都使用同一个任务目录。

## 看板

- 暂无任务；真实工作需要跨会话承载时，由 `karl-task-pdoc` 或 `karl-loop-task-prompt` 创建第一个 Task。

## Checkbox 语义

```text
[ ] 未开始
[>] 正在做
[?] 等 Karl 确认或验收
[!] 阻塞或风险
[x] 已完成 / 已被覆盖
```

## 写入规则

1. Task 必须区分已成立事实、候选事实与未知，不能把讨论过的方向自动当作 PRD 事实。
2. Task 关闭前说明结论进入模块 PRD、`PRODUCT.md`、代码、原型或证据，还是明确不晋升。
3. 等 Karl 肉眼、真实设备、真实账号或真实素材验收时写成 `[?]`，不要写成 blocked。
4. 只有尝试替代办法仍无法推进时才写 `[!]`。
5. `00-index.md` 只保存入口与短摘要，完整目标、工作状态和证据留在对应 Task。
