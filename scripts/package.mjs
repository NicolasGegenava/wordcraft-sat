import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
let html = await readFile(join(root, 'index.html'), 'utf8');
const css = await readFile(join(root, 'style.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`);
for (const file of ['vocab.js', 'notes.js', 'app.js']) {
  const source = (await readFile(join(root,file),'utf8')).replace(/<\/script/gi,'<\\/script');
  const tag = `<script src="${file}" defer></script>`;
  if(!html.includes(tag)) throw Error(`Missing script tag: ${file}`);
  html = html.replace(tag,'');
  // Inline classic scripts must run after the document's quiz elements exist.
  html = html.replace('</body>', () => `<script>\n${source}\n</script>\n</body>`);
}
await writeFile(join(root,'wordcraft.html'),html);
await mkdir(join(root,'_site'),{recursive:true});
for(const file of ['index.html','style.css','vocab.js','notes.js','app.js','wordcraft.html','.nojekyll']) {
  await copyFile(join(root,file),join(root,'_site',file));
}
console.log('Prepared _site/ and standalone wordcraft.html. No dependencies or server required.');
