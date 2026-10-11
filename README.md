# Page Guide Agent

全量已注册组件悬停可显示就近深色磨砂说明卡；对话指向的组件同样可悬停查看。对话指向增加按当前顺序排列的编号，选择本身只显示框选与角标，不展开常驻卡。页面始终最多显示当前悬停对象的一张说明卡，移开后收起；默认无标注，复制组件 ID 保留。完整入口、检查及接续见[四项工作流](.PROJECT/annotation-workflows.md).

让Codex理解目标并准备组件知识。网页只显示组件框和数字角标，正文留在对话；AI随讲解追加、替换和撤下框选。普通hover显示唯一就近深色说明卡与复制ID图标，没有路径窗。

当前扩展支持完整组件框、数字和page_guide_show的追加／替换／撤下；返回相同编号的标题与正文供对话讲解。28项检查及真实pump.fun演示见 [Task 11](.TASK/11-high-value-path.md)。图表和隐藏面板仍有覆盖缺口；通信与开发更新见 [Task 07](.TASK/07-mcp-page-annotations.md)。

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
