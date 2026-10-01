# Tasks Index

execution_mode: interactive

本文件只登记真实 Task 入口和最小恢复摘要，不写 Task 正文。尚未成熟为 PRD 的候选问题、由 PRD 产生的实现与验收工作，以及按需采用的 PDOC / Loop Task 都使用同一个任务目录。

## 看板

- [x] 01-cdp-guide-prototype.md：第一阶段原型验证（已完成，五项验收证据齐备）。
- [x] 02-phase2-interactive-wizard.md：旧目标已被对话驱动方向替代；T1–T4 实现保留，T5/T6 未验收，不记作通过。
- [>] [03-project-team.md](03-project-team.md)：建设对话转为 Leader；两个业务岗位改用独立会话，建设工作树正在调整与试跑，定时未启动。
- [x] [04-conversation-driven-annotations.md](04-conversation-driven-annotations.md)：产品定义、导航与 LEARN02/03 已更新和检查，保存本地提交；运行实现另需授权。

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
