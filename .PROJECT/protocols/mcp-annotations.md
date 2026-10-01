# MCP 页面标注协议

本合同对应 `src/contract.mjs` 与内容脚本。六项工具只处理标注；`text` 是标注文字，不填写表单。数组表示同一批标注，不是自动播放步骤。

当前产品暂定编号与对象名称常驻，不使用悬停或聚焦触发显示，在对话中按编号提供定义、例子和比较。使用 `type: "marker"`、`number: 4`、`text: "被引用页面"`；number 是1～99的整数，text 是1～80字符的单行对象名称，不含编号或解释。其他类型不接受 number，没有 details 字段。不增加点击展开、悬停详细解释或更多入口。

marker 是不接收鼠标事件的覆盖层：32像素圆编号、对象名称和8%透明度的淡色覆盖常驻，不在目标上添加悬停或焦点监听。名称使用与编号一致的 color 主题色底、白色文字，字号14像素；名称尽量放在目标外侧，不盖输入文字。多项常驻时检查名称是否互相重叠或遮挡网页信息，必要时调整 placement 与 offset。点击、输入和焦点仍由原网页控件处理。定位、滚动、更新、清理与失效检查沿用原方法。

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

每批 1～20 项，ID 唯一。`type` 支持 marker、highlight、arrow、callout、combined；旧调用仍默认 combined，当前轻量指引明确传 marker。旧类型文字最长1000字符。`placement` 为 top/right/bottom/left，默认 bottom；marker 沿对应目标边缘放编号，top/bottom 靠右侧，offset 的 x/y 移动编号，名称跟随并收回视口，淡色覆盖始终贴合目标。旧类型的 offset 移动提示与箭头，目标框仍贴合元素。offset 为 CSS 像素，范围 -1000～1000。纯箭头无文字时默认从目标上方55像素指向目标。`color` 可选，格式为六位十六进制色值。

同时解释关键词和比较按钮的参数示例：

```json
{
  "page_id": "使用 page_guide_pages 刚返回的句柄",
  "session_id": "当前 Codex 会话 ID",
  "annotations": [
    {"id": "keyword", "target": {"label": "关键词"}, "type": "marker", "number": 1, "text": "关键词", "placement": "top"},
    {"id": "compare", "target": {"css": "#compare"}, "type": "marker", "number": 2, "text": "比较选项", "placement": "top"}
  ]
}
```

成功返回 `ok`、ID、匹配数、`target_box`、最终 `callout_box`、颜色、文档 ID 和构建版本；marker 还返回 number、marker_box 和 name_visible。callout_box 是名称实际位置，有效 marker 的 name_visible 为 true；status 会重新检查当前位置与状态，目标失效时撤下节点并报告。桥接或页面错误在 MCP 返回 `isError: true` 与具体文字；动态失效在 status 单项的 `ok: false` 中报告。常见错误为 TARGET_NOT_FOUND、TARGET_AMBIGUOUS、TARGET_NOT_VISIBLE、TARGET_OUTSIDE_VIEWPORT、UNSUPPORTED_SCOPE、STALE_PAGE 和 EXTENSION_DISCONNECTED。

新批次有一个目标验证失败时，本次修改全部拒绝，旧标注保留，不取第一个匹配。后续布局变化可分别使某些标注失效，status 逐项反馈。提示用 textContent 显示，不执行 HTML；覆盖层不接收鼠标事件，保留正常输入与按钮操作。

开发服务只在指定的本机 `/fixture` 测试页恢复标注。整页刷新会丢失测试输入、展开状态和滚动；这不是局部热更新。正式连接重启不自动重放请求或恢复旧标注，先重新观察再调用。
