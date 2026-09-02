# 本地任务包服务（Agent 侧）

Agent 在此目录管理 `guides.json`（格式 `{"guides": [...]}`），并通过任意静态服务在 `http://127.0.0.1:8765/guides.json` 暴露。插件打开或点击「从 Agent 服务刷新任务包」时从这里拉取；服务不可用时回退到插件本地缓存。

本地试运行：

```bash
cd prototype/service && python3 -m http.server 8765
```
