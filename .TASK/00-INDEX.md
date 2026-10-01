# Tasks Index

execution_mode: interactive

本文件只登记真实 Task 入口和最小恢复摘要，不写 Task 正文。尚未成熟为 PRD 的候选问题、由 PRD 产生的实现与验收工作，以及按需采用的 PDOC / Loop Task 都使用同一个任务目录。

## 看板

- [x] 01-cdp-guide-prototype.md：第一阶段原型验证（已完成，五项验收证据齐备）。
- [x] 02-phase2-interactive-wizard.md：旧目标已被对话驱动方向替代；T1–T4 实现保留，T5/T6 未验收，不记作通过。
- [>] [03-project-team.md](03-project-team.md)：建设对话转为 Leader；两个业务岗位改用独立会话，建设工作树正在调整与试跑，定时未启动。
- [ ] [04-conversation-driven-annotations.md](04-conversation-driven-annotations.md)：已有 WEBTASK 工具编排与 SEO 成稿检查完成；新 MEME PVP 探索体验示例已呈稿，按 Karl 对“只有宽泛兴趣”的反馈修订，待确认后再更新技能。两条完整业务路径仍待真实验收。
- [x] [05-workspace-migration.md](05-workspace-migration.md)：文件结构、入口与引用迁移完成，内容保留及实际材料检查通过；TEAM 控制工作树未移动。
- [x] [06-extension-development-tools.md](06-extension-development-tools.md)：官方开发工具检查通过；Karl 手动加载后，旧扩展在内置浏览器测试页真实绘制并撤下标注。对话调用另需实现。

- [x] [07-mcp-page-annotations.md](07-mcp-page-annotations.md)：MCP、开发更新和真实扩展检查完成；11 项自动检查通过。当前原生会话工具发现与复杂网页多轮体验留作后续验收。
- [x] [08-expandable-annotation-details.md](08-expandable-annotation-details.md)：marker 编号与名称常驻，已移除悬停/焦点触发；14项检查、真实扩展输入与 Semrush 呈现通过，协议和技能已同步，原点击展开方案暂不实施。

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
5. `00-INDEX.md` 只保存入口与短摘要，完整目标、工作状态和证据留在对应 Task。
