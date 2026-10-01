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
  type: z.enum(['highlight','arrow','callout','combined']).default('combined'),
  text: z.string().max(1000).default(''),
  placement: z.enum(['top','right','bottom','left']).default('bottom'),
  offset: offset.default({x:0,y:0}),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()
}).strict();
const annotations=z.array(annotationSchema).min(1).max(20).refine(a=>new Set(a.map(x=>x.id)).size===a.length,'Duplicate annotation ID');
const page={page_id:z.string().min(1).max(4096)};
const session={...page,session_id:id};
export const schemas={
  page_guide_pages:z.object({}).strict(),
  page_guide_inspect:z.object({...page,target}).strict(),
  page_guide_annotate:z.object({...session,annotations,replace:z.boolean().default(true)}).strict(),
  page_guide_update:z.object({...session,annotations}).strict(),
  page_guide_clear:z.object({...session,ids:z.array(id).max(20).optional()}).strict(),
  page_guide_status:z.object(session).strict()
};
const descriptions={
  page_guide_pages:'列出真实已配对扩展与可用页面；使用返回的页面句柄，不能猜 tab ID。',
  page_guide_inspect:'核对指定 DOM 目标是否唯一、可见，并返回真实几何；不修改业务网页。',
  page_guide_annotate:'在指定页面和会话绘制一批标注；全部目标验证通过才修改。text 是注释文字，不填写表单。',
  page_guide_update:'按 ID 更新已有标注，完整提供新的目标、形式、文字和偏移。',
  page_guide_clear:'撤下指定会话的全部或部分标注；不会清理其他会话。',
  page_guide_status:'取得当前会话各标注的真实状态，包括目标失效或位置变化。'
};
export const tools=Object.entries(schemas).map(([name,schema])=>({
  name,description:descriptions[name],inputSchema:zodToJsonSchema(schema,{$refStrategy:'none'}),
  annotations:{readOnlyHint:['page_guide_pages','page_guide_inspect','page_guide_status'].includes(name),destructiveHint:false,openWorldHint:false}
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
