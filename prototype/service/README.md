# Agent 任务包

Agent 在此目录管理 `guides.json`（格式 `{"guides": [...]}`）。插件优先直接读取这个固定文件路径（需要用户在扩展详情页开启「允许访问文件网址」）；HTTP 静态服务只是可选备份通道。

本地试运行：

```bash
cd prototype/service && python3 -m http.server 8765
```
