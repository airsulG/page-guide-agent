import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const STATE=ROOT+'.page-guide/';
export async function state(){
  await mkdir(STATE,{recursive:true,mode:0o700});
  try { return JSON.parse(await readFile(STATE+'connection.json','utf8')); }
  catch(e){
    if(e.code!=='ENOENT') throw e;
    const s={port:8767,token:randomBytes(32).toString('hex'),project:'page-guide-agent'};
    try {await writeFile(STATE+'connection.json',JSON.stringify(s),{mode:0o600,flag:'wx'});return s;}
    catch(e){if(e.code==='EEXIST') return JSON.parse(await readFile(STATE+'connection.json','utf8'));throw e;}
  }
}
