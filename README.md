# Page Guide Agent

让 Codex 在与你共同使用网页时，直接在页面上指给你看，并根据你的问题和操作结果持续调整帮助。已确认愿景是 Codex 对话、内置浏览器与无独立前端的标注插件共同工作，完整解释和知识留在对话。

当前代码仍是旧 Chrome Side Panel 原型，新体验尚未接入内置浏览器。第一阶段有验收证据，旧第二阶段的完成判定和 Lesson 已有实现，但真实插件人工验收没有完成。完整事实见 [产品](.PROJECT/01-PRODUCT.md)与[模块规格](.PROJECT/modules/page-guide-agent.md)。

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

`prototype/` 和 `skill/` 保持原位置，避免改变旧插件加载和任务包路径。TEAM 使用独立控制工作树，运行状态不在 main 更新。
