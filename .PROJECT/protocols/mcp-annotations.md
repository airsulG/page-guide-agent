# MCP 页面标注协议

本合同对应 `src/contract.mjs` 与内容脚本。六项工具只处理标注；`text` 是标注文字，不填写表单。数组表示同一批标注，不是自动播放步骤。

当前使用 `type: "connector"`、`number: 4`、`text: "被引用页面"`：编号徽章贴近对象，以无箭头线段连接名称标注，全部常驻，不使用悬停或聚焦触发。在对话按编号提供定义、例子和比较。number 是1～99的整数；connector、编号 arrow 和 marker 的 text 是1～80字符的单行对象名称，不含编号或解释。number 只允许用于 connector、arrow 或 marker，没有 details 字段或网页详情入口。

connector 不绘制目标框或淡色覆盖。名称字号15像素、主题色背景，对象旁为32像素圆编号、字号15像素；线段从编号边缘连到名称边缘，没有箭头。每项 color 可选，格式为六位十六进制色值 #RRGGBB，默认 #8b5cf6；同一项的线段、名称背景与徽章使用同色，文字随背景明暗自动采用深色或白色。数组中同类传相同颜色、不同类传不同颜色，在对话说明含义；仍用名称编号识别对象，不只靠颜色。

名称尽量放在目标外侧，不盖输入文字。多项常驻时检查是否重叠或遮挡，必要时调整 placement 与 offset。覆盖层不接收鼠标事件，不添加目标悬停或焦点监听，点击、输入与焦点由原网页控件处理。marker 保留旧淡色覆盖与独立编号呈现供兼容；定位、更新、清理与失效检查沿用原方法。

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

每批 1～20 项，ID 唯一。`type` 支持 connector、marker、highlight、arrow、callout、combined；旧调用仍默认 combined，当前指引明确传 connector 和 number。未编号的旧类型文字最长1000字符。`placement` 为 top/right/bottom/left，默认 bottom；connector 把编号放在目标对应边缘约6像素外、名称约80像素外；offset 的 x/y 只移动名称，编号保持贴近目标，线段随之更新；边缘空间不足时收回视口。offset 为 CSS 像素，范围 -1000～1000。旧 marker 的偏移移动独立编号，覆盖始终贴合目标；其他旧类型行为保留。纯箭头无文字时默认从目标上方55像素指向目标。

`page_guide_update` 要传完整新规格，包括要保留的 number、text 和 color；省略 color 会恢复默认紫色。颜色组合没有另外的分类字段，分类含义由本次对话决定，不改变定位、操作权限或步骤顺序。

同时解释关键词和比较按钮的参数示例：

```json
{
  "page_id": "使用 page_guide_pages 刚返回的句柄",
  "session_id": "当前 Codex 会话 ID",
  "annotations": [
    {"id": "keyword", "target": {"label": "关键词"}, "type": "connector", "number": 1, "text": "关键词", "placement": "top", "color": "#7c3aed"},
    {"id": "compare", "target": {"css": "#compare"}, "type": "connector", "number": 2, "text": "比较选项", "placement": "right", "color": "#0f766e"}
  ]
}
```

成功返回 `ok`、ID、匹配数、`target_box`、最终 `callout_box`、color、文档 ID 和构建版本；connector 还返回 number、marker_box（对象旁编号位置）、name_visible: true 和 connector 的 start/end 坐标。marker 保留原返回字段，编号 arrow 仍返回名称角标和 arrow 坐标供兼容。callout_box 是名称实际位置；status 重新检查当前位置与状态，目标失效时撤下节点并报告。桥接或页面错误在 MCP 返回 `isError: true` 与具体文字；动态失效在 status 单项的 `ok: false` 中报告。常见错误为 TARGET_NOT_FOUND、TARGET_AMBIGUOUS、TARGET_NOT_VISIBLE、TARGET_OUTSIDE_VIEWPORT、UNSUPPORTED_SCOPE、STALE_PAGE 和 EXTENSION_DISCONNECTED。

新批次有一个目标验证失败时，本次修改全部拒绝，旧标注保留，不取第一个匹配。后续布局变化可分别使某些标注失效，status 逐项反馈。提示用 textContent 显示，不执行 HTML；覆盖层不接收鼠标事件，保留正常输入与按钮操作。

开发服务只在指定的本机 `/fixture` 测试页恢复标注。整页刷新会丢失测试输入、展开状态和滚动；这不是局部热更新。正式连接重启不自动重放请求或恢复旧标注，先重新观察再调用。
