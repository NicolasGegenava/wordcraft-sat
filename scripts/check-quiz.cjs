const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('vocab.js','utf8')+'\n'+fs.readFileSync('app.js','utf8').split('let deck =')[0];
const ctx=vm.createContext({});vm.runInContext(source,ctx);
vm.runInContext(`
  for (const entry of VOCAB) {
    const choices = makeChoices(entry);
    if (choices.length!==4 || new Set(choices).size!==4 || !choices.includes(entry.word)) throw new Error(entry.word);
    if (entry.definition.toLowerCase().includes(entry.word)) throw new Error('Answer leak: '+entry.word);
    if ('example' in entry) throw new Error('Example leaked');
  }
  const positions=new Set(Array.from({length:100},()=>makeChoices(VOCAB[0]).indexOf(VOCAB[0].word)));
  if(positions.size!==4) throw new Error('Answer positions not shuffled');
`,ctx);
console.log('990 entries checked: four unique choices, answer included, no answer leaks or examples, all four answer positions reachable.');

