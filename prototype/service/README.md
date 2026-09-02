# Agent 任务包

Agent 在 `tasks/` 目录管理任务：**一个任务一个文件夹**（PRD 的 Task File 模型），内含该任务的 `guide.json`；`tasks/index.json` 是发现索引，插件先读索引、再按 `dir` 逐个加载任务文件。

```text
tasks/
  index.json
  openrouter-model-compare/guide.json
  openrouter-cheapest/guide.json
  <新任务 slug>/guide.json    ← Agent 新增任务 = 新文件夹 + 索引加一行
```

本地试运行：

```bash
cd prototype/service && python3 -m http.server 8765
```
