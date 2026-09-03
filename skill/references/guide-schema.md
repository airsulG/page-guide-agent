# guide.json Schema

真实消费者：Page Guide Agent 插件（`prototype/extension/content.js`）。改字段前先确认插件支持。

```json
{
  "id": "任务 slug，与文件夹名一致（可选但推荐）",
  "task": "任务名，显示在任务卡标题",
  "description": "一句话任务简介，显示在任务卡描述区（可选但推荐）",
  "pageBinding": {
    "urlPattern": "URL 匹配规则，插件按 includes 匹配当前页面",
    "landmarks": ["页面地标文本，用于确认页面身份"]
  },
  "revisionLog": [
    { "at": "ISO 时间", "event": "self-heal", "repaired": [{"id": 1}], "expired": [] }
  ],
  "steps": [
    {
      "id": 1,
      "primary":   { "strategy": "placeholder | text | css", "value": "主定位" },
      "fallback":  { "strategy": "css", "value": "备选定位" },
      "completion": { "type": "input | click | check", "valueContains": "可选，input 内容校验" },
      "comment": "三层注释：是什么 / 怎么用 / 与相邻项关系",
      "lesson": {
        "title": "知识卡标题",
        "blocks": [
          { "type": "text", "content": "正文段落" },
          { "type": "list", "items": ["列表项"] },
          { "type": "tip",  "content": "要点提示" }
        ]
      }
    }
  ]
}
```

## 字段规则

- `completion.type=input`：值非空即完成；`valueContains` 给出时要求包含该子串（大小写不敏感）。
- `completion.type=click`：监听该元素的捕获阶段 click。
- `completion.type=check`：元素 `checked === true`。
- 无 `completion` 的步骤回退「下一步」手动推进；同一任务里自动与手动步骤可混用。
- `lesson` 可省略；省略时气泡不显示「深入了解」入口。
- `strategy=text` 使用 XPath `normalize-space(text())` 精确匹配，生成前确认页面唯一。

## 参考实现

完整真实样例：`/Users/zhouqi/Desktop/工作区/51-page-guide-agent/prototype/service/tasks/openrouter-model-compare/guide.json`（四步，input+click 混合，全部带 lesson）。
