import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const id = z.string().min(1).max(200);
const target = z.object({
  css: z.string().min(1).max(1000).optional(),
  text: z.string().min(1).max(500).optional(),
  label: z.string().min(1).max(500).optional(),
  frame_path: z.array(z.string().min(1).max(500)).max(4).default([]),
  shadow_path: z.array(z.string().min(1).max(500)).max(4).default([])
}).strict().refine(t => [t.css, t.text, t.label].filter(Boolean).length === 1,
  'Specify exactly one of css, text, label');
const offset = z.object({x:z.number().min(-1000).max(1000).default(0),y:z.number().min(-1000).max(1000).default(0)}).strict();
export const annotationSchema = z.object({
  id, target,
  type: z.enum(['connector','marker','highlight','arrow','callout','combined']).default('combined'),
  number: z.number().int().min(1).max(99).optional(),
  text: z.string().max(1000).default(''),
  placement: z.enum(['top','right','bottom','left']).default('bottom'),
  offset: offset.default({x:0,y:0}),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
}).strict().superRefine((a,ctx)=>{
  if(['marker','connector'].includes(a.type)||(a.type==='arrow'&&a.number!==undefined)){
    if(a.number===undefined)ctx.addIssue({code:z.ZodIssueCode.custom,path:['number'],message:a.type+' requires a number'});
    if(!a.text.trim()||a.text.length>80||/[\r\n]/.test(a.text))ctx.addIssue({code:z.ZodIssueCode.custom,path:['text'],message:'numbered annotation text must be a single object name of 1-80 characters'});
  }else if(a.number!==undefined)ctx.addIssue({code:z.ZodIssueCode.custom,path:['number'],message:'number is only supported for marker, connector or arrow'});
});
const annotations=z.array(annotationSchema).min(1).max(20).refine(a=>new Set(a.map(x=>x.id)).size===a.length,'Duplicate annotation ID');
const page={page_id:z.string().min(1).max(4096)};
const session={...page,session_id:id};
const helpComponent=z.object({id,target,title:z.string().min(1).max(120),body:z.string().min(30).max(1800)}).strict();
const helpComponents=z.array(helpComponent).min(1).max(1000).refine(a=>new Set(a.map(x=>x.id)).size===a.length,'Duplicate component ID');
const tutorial=z.object({title:z.string().min(1).max(120),goal:z.string().min(1).max(600),steps:z.array(z.object({component_id:id,title:z.string().min(1).max(120),action:z.string().min(1).max(900),expected:z.string().min(1).max(600)}).strict()).min(1).max(40)}).strict();
export const schemas={
  page_guide_inventory:z.object(page).strict(),
  page_guide_help:z.object({...session,components:helpComponents,tutorial:tutorial.optional()}).strict().superRefine((a,ctx)=>{
    for(const c of a.components)if(c.target.frame_path.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Help does not yet support iframe targets'});
    for(const step of a.tutorial?.steps||[])if(!a.components.some(c=>c.id===step.component_id))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Tutorial references an unknown component'});
    if(Buffer.byteLength(JSON.stringify(a),'utf8')>1800000)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Help batch exceeds 1.8 MB; shorten repeated descriptions before registering the complete page'});
  }),
  page_guide_pages:z.object({}).strict(),
  page_guide_inspect:z.object({...page,target}).strict(),
  page_guide_annotate:z.object({...session,annotations,replace:z.boolean().default(true)}).strict(),
  page_guide_update:z.object({...session,annotations}).strict(),
  page_guide_clear:z.object({...session,ids:z.array(id).max(20).optional()}).strict(),
  page_guide_status:z.object(session).strict()
};
const descriptions={
  page_guide_inventory:'列出整页语义组件和唯一 CSS 定位，包括视口外对象；用于逐项编写有知识增量的说明，不能把清单数量当成完整覆盖证明。',
  page_guide_help:'注册整页组件知识说明及可选浮动教程。默认无标记、高亮或遮罩，仅悬停显示对应说明；教程支持键盘和连续步骤，不自动点击业务控件。每条 body 应解释含义、动作、结果或区别，采用 Apple 技术支持式具体措辞。',
  page_guide_pages:'列出真实已配对扩展与可用页面；使用返回的页面句柄，不能猜 tab ID。',
  page_guide_inspect:'核对指定 DOM 目标是否唯一、可见，并返回真实几何；不修改业务网页。',
  page_guide_annotate:'在指定页面和会话绘制一批标注；全部目标验证通过才修改。当前指引用 type: connector、number 和对象名称 text，编号贴近对象，以无箭头线段连接名称标注，全部常驻且不拦截原操作。每项 color 接受 #RRGGBB，可在数组内用不同颜色分类；解释留在对话。',
  page_guide_update:'按 ID 更新已有标注，完整提供新的目标、形式、文字、编号、偏移与可选 color；省略 color 恢复默认紫色。',
  page_guide_clear:'撤下指定会话的全部或部分标注；不会清理其他会话。',
  page_guide_status:'取得当前会话各标注的真实状态，包括目标失效或位置变化。'
};
export const tools=Object.entries(schemas).map(([name,schema])=>({
  name,description:descriptions[name],inputSchema:zodToJsonSchema(schema,{$refStrategy:'none'}),
  annotations:{readOnlyHint:['page_guide_pages','page_guide_inspect','page_guide_status','page_guide_inventory'].includes(name),destructiveHint:false,openWorldHint:false}
}));
export function parseCall(name,args){
  if(!schemas[name]) throw new Error('Unknown tool: '+name);
  return schemas[name].parse(args);
}
export function pageId(page){ return Buffer.from(JSON.stringify(page)).toString('base64url'); }
export function decodePage(id){
  try {
    const p=JSON.parse(Buffer.from(id,'base64url').toString('utf8'));
    if(typeof p.instance_id!=='string'||!Number.isInteger(p.tab_id)||typeof p.document_id!=='string'||typeof p.url!=='string') throw new Error();
    if(!/^https?:\/\//.test(p.url)) throw new Error();
    return p;
  } catch {throw new Error('INVALID_PAGE_HANDLE: 请重新调用 page_guide_pages');}
}
