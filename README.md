# Page Guide Agent

让 Codex 在与你共同使用网页时，直接在页面上指给你看，并根据你的问题和操作结果持续调整帮助。已确认愿景是 Codex 对话、内置浏览器与无独立前端的标注插件共同工作，完整解释和知识留在对话。

当前 0.2.0 是无侧栏的 MCP 标注扩展，已在 Codex 内置浏览器通过真实 SDK 调用验证批量、更新、清理和开发自动更新。当前对话原生工具列表尚未刷新，复杂业务网页多轮体验和本地复用仍需验收。版本与截图见 [Task 07](.TASK/07-mcp-page-annotations.md)，产品目标见 [产品](.PROJECT/01-PRODUCT.md)与[模块规格](.PROJECT/modules/page-guide-agent.md)。

## 运行 MCP 开发版

使用 Node 24 或更新版本，在根目录运行 `npm ci`，再运行 `npm run guide:dev`。已有开发扩展加载目录为 `prototype/extension/`，Karl 已完成新后台首次重载；后续修改 `src/extension/` 自动生成、重载扩展，并只刷新选定的测试页。

打开 `http://127.0.0.1:8767/fixture`。Codex 使用已配置的 `page-guide-agent` MCP；已有会话未发现工具时，重载该 MCP 服务或在后续自然开始的会话确认工具发现。也可用 `node scripts/call.mjs list` 检查真实 SDK 协议。六项工具、参数与限制见 [标注协议](.PROJECT/protocols/mcp-annotations.md)，运行、正式构建和错误恢复见 [开发说明](.PROJECT/04-DEVELOPMENT.md)。

## 查看已有演示

在仓库根目录运行：

```bash
python3 -m http.server 8766 --bind 127.0.0.1 --directory .PROTOTYPE/surface-tutorials
```

打开 `http://127.0.0.1:8766/clash-verge-guide.html`。这是保留的说明演示与观察材料，不是新产品的独立阅读入口，也不是实时浏览器接入。停止服务使用 Ctrl+C；端口被占用时换一个空闲端口。原型依赖、运行和检查方法见 [开发说明](.PROJECT/04-DEVELOPMENT.md)。

## 继续项目工作

- [AGENTS](AGENTS.md)：执行约定、工作区导航和当前任务入口。
- [长期文档索引](.PROJECT/00-INDEX.md)：产品、架构、开发与模块正文。
- [EVAL](EVAL.md)：已确认的核心结果标准。
- [任务索引](.TASK/00-INDEX.md)：沿原任务读取授权、版本、结果与下一步。
- [演示与验证材料](.PROTOTYPE/README.md)：旧演示、原始观察与检查证据。

`prototype/` 和 `skill/` 保持原位置；扩展目录已生成新 MCP 实现，旧侧栏文件不再引用，旧任务包只作历史材料。TEAM 使用独立控制工作树，运行状态不在 main 更新。
