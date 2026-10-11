# Page Guide Agent

让 Codex 理解你的目标，在内置浏览器为整页组件准备有知识增量的说明：平时页面保持原样，悬停时显示对应知识。需要完成目标时，网页内的浮动教程把组件串成连续动作；对话继续负责需求理解、跨工具编排、深入追问和结果判断。

当前在原 0.2.0 扩展上增加整页悬停说明和可访问的浮动教程，23 项自动检查及 pump.fun 的真实扩展调用、鼠标悬停、键盘阅读和原输入已检查。图表加载和未打开面板仍有覆盖缺口，见 [Task 09](.TASK/09-full-page-hover-tutorial.md)。历史通信与开发更新证据见 [Task 07](.TASK/07-mcp-page-annotations.md)，产品目标见 [产品](.PROJECT/01-PRODUCT.md)与[模块规格](.PROJECT/modules/page-guide-agent.md)。

## 运行 MCP 开发版

使用 Node 24 或更新版本，在根目录运行 `npm ci`，再运行 `npm run guide:dev`。已有开发扩展加载目录为 `prototype/extension/`，Karl 已完成新后台首次重载；后续修改 `src/extension/` 自动生成、重载扩展，并只刷新选定的测试页。

打开 `http://127.0.0.1:8767/fixture`。Codex 使用已配置的 `page-guide-agent` MCP；已有会话未发现工具时，重载该 MCP 服务或在后续自然开始的会话确认工具发现。也可用 `node scripts/call.mjs list` 检查真实 SDK 协议。八项工具含整页清单、组件知识与教程，参数和限制见 [协议](.PROJECT/protocols/mcp-annotations.md)，运行、正式构建和错误恢复见 [开发说明](.PROJECT/04-DEVELOPMENT.md)。

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
