import {build} from 'esbuild';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hash=createHash('sha256');
const inputs=['app.js','data.js','i18n.js','update-check.js','index.template.html','build.mjs',...(await readdir('assets')).sort().map(n=>'assets/'+n)];
for(const path of inputs){hash.update(path);hash.update(await readFile(path));}
const buildId=hash.digest('hex').slice(0,20);
const result=await build({entryPoints:['app.js'],bundle:true,minify:true,write:false,format:'iife',target:'es2020',define:{__ORBIT_BUILD_ID__:JSON.stringify(buildId)}});
let script=result.outputFiles[0].text;
for(const [key,file] of [['__DAY__','earth-day.jpg'],['__NIGHT__','earth-night.jpg']])script=script.replace(key,'data:image/jpeg;base64,'+(await readFile('assets/'+file)).toString('base64'));
let fonts=await readFile('assets/fonts.css','utf8');
for(const name of new Set([...fonts.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1])))fonts=fonts.replaceAll(name,'data:font/ttf;base64,'+(await readFile('assets/'+name)).toString('base64'));
const html=(await readFile('index.template.html','utf8')).replace('__TIGER_HERO__','data:image/webp;base64,'+(await readFile('assets/tiger-hero.webp')).toString('base64')).replace('/*FONTS*/',()=>fonts).replace('/*APP*/',()=>script.replaceAll('</script','<\\/script'));
await writeFile('index.html',html);
await writeFile('version.json',JSON.stringify({version:buildId})+'\n');console.log('index.html erzeugt — '+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MB');
