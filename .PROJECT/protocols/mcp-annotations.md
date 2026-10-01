# MCP 页面标注协议

本合同对应 `src/contract.mjs` 与内容脚本。六项工具只处理标注；`text` 是标注文字，不填写表单。数组表示同一批标注，不是自动播放步骤。

当前产品暂定网页标注只显示对象名称与编号，例如 `text: "④ 被引用页面"`；在对话中用④提供定义、例子和比较。不增加点击展开、悬停详情或更多入口。编号直接写入现有 text，下面的类型与长度描述实际接口能力，不要求教学时叠加所有形式；本合同没有 number 或 details 字段。

| 工具 | 输入与实际结果 |
|---|---|
| `page_guide_pages` | 空对象；返回已配对浏览器、页面与 `page_id`。无连接时 `connected: 0`；某页没有新内容脚本时句柄为空 |
| `page_guide_inspect` | `page_id`、`target`；返回唯一匹配、可见状态和真实边界，否则错误 |
| `page_guide_annotate` | `page_id`、`session_id`、`annotations`、可选 `replace`；默认替换本会话全部标注，`false` 按 ID 合并 |
| `page_guide_update` | 页面、会话和完整新标注数组；每个 ID 必须已存在，整批验证后更新 |
| `page_guide_clear` | 页面、会话、可选 `ids`；不传 ID 清理本会话全部，返回实际清理 ID |
| `page_guide_status` | 页面、会话；重新定位后返回各标注结果，失效目标会撤下 |

先观察网页，再调用页面列表取得当下句柄，随后 inspect 和 annotate。句柄绑定实例、tab、文档 UUID 和 URL，不猜 tab ID；重载或跳转后重新取得。当前对话使用稳定会话 ID，避免误清理别的会话，不默认遍历所有会话。

`target` 必须且只能提供一个定位方式：CSS `css`、精确叶节点文字 `text`、关联 label 或 aria-label `label`。`frame_path` 是依次进入的同源 iframe CSS 数组，`shadow_path` 是开放 Shadow DOM 宿主数组，每种最多四层。先进入所有 iframe，再进入 Shadow DOM；本版不支持二者交错。跨源 iframe、关闭的 Shadow DOM、iframe 或其祖先有变换时返回不支持；目标被 frame 边界裁切时返回不可见，先在 frame 内滚动到完整目标。目标需唯一且在视口可见，工具不会代替用户滚动。

每批 1～20 项，ID 唯一。`type` 支持 highlight、arrow、callout、combined，默认组合；文字最长 1000 字符。`placement` 为 top/right/bottom/left，默认 bottom；`offset` 的 x/y 为 CSS 像素，范围 -1000～1000，它移动提示与箭头，目标框仍贴合元素。纯箭头无文字时默认从目标上方 55 像素指向目标。`color` 可选，格式为六位十六进制色值。

同时解释关键词和比较按钮的参数示例：

```json
{
  "page_id": "使用 page_guide_pages 刚返回的句柄",
  "session_id": "当前 Codex 会话 ID",
  "annotations": [
    {"id": "keyword", "target": {"label": "关键词"}, "type": "callout", "text": "① 关键词", "placement": "bottom", "offset": {"x": 20, "y": 12}},
    {"id": "compare", "target": {"css": "#compare"}, "type": "callout", "text": "② 比较选项"}
  ]
}
```

成功返回 `ok`、ID、匹配数、`target_box`、最终 `callout_box`、颜色、文档 ID 和构建版本。桥接或页面错误在 MCP 返回 `isError: true` 与具体文字；动态失效在 status 单项的 `ok: false` 中报告。常见错误为 TARGET_NOT_FOUND、TARGET_AMBIGUOUS、TARGET_NOT_VISIBLE、TARGET_OUTSIDE_VIEWPORT、UNSUPPORTED_SCOPE、STALE_PAGE 和 EXTENSION_DISCONNECTED。

新批次有一个目标验证失败时，本次修改全部拒绝，旧标注保留，不取第一个匹配。后续布局变化可分别使某些标注失效，status 逐项反馈。提示用 textContent 显示，不执行 HTML；覆盖层不接收鼠标事件，保留正常输入与按钮操作。

开发服务只在指定的本机 `/fixture` 测试页恢复标注。整页刷新会丢失测试输入、展开状态和滚动；这不是局部热更新。正式连接重启不自动重放请求或恢复旧标注，先重新观察再调用。
