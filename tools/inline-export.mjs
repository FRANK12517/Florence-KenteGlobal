import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=resolve(process.cwd());
const index=await readFile(resolve(root,'dist/index.html'),'utf8');
const cssName=index.match(/href="(\/assets\/[^\"]+\.css)"/)?.[1];
const jsName=index.match(/src="(\/assets\/[^\"]+\.js)"/)?.[1];
if(!cssName||!jsName)throw new Error('Production asset references not found.');
const css=await readFile(resolve(root,'dist',cssName.replace('/assets/','assets/')),'utf8');
const js=await readFile(resolve(root,'dist',jsName.replace('/assets/','assets/')),'utf8');
let html=index.replace(/<link rel="stylesheet"[^>]+>/,()=>`<style>${css}</style>`).replace(/<script type="module"[^>]+><\/script>/,'').replace(/<link rel="manifest"[^>]+>/,'').replace('<div id="root"></div>','<div class="standalone-boundary" role="note"><strong>Standalone frontend export:</strong> catalogue, search, filters, cart, forms, and local browser interactions work in this file. Live payment, authentication, database, API, webhook, notification, and fulfillment operations require the deployed KenteGlobal services.</div><div id="root"></div>');
html=html.replace('</body>',()=>`<script>${js}<\/script></body>`);
await writeFile(resolve(root,'KenteGlobal-standalone.html'),`<!doctype html>\n${html}`,'utf8');
console.log('Wrote KenteGlobal-standalone.html');
