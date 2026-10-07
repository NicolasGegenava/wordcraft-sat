const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=['vocab.js','notes.js','app.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const disk=new Map();
class Element {
 constructor(){this.children=[];this.style={};this.classList={add(){}};this.textContent='';}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(){} addEventListener(){} focus(){}
}
function create(storage={getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v)}){
 const els=new Map();const get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};
 const ctx=vm.createContext({localStorage:storage,document:{getElementById:get,querySelector:get,createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){}},window:{addEventListener(){}}});
 vm.runInContext(source,ctx);return {ctx,els,run:s=>vm.runInContext(s,ctx)};
}
const a=create();
a.run(`choose(currentChoices.findIndex(w=>w!==round[index].word)); choose(0); nextQuestion(); for(let n=1;n<20;n++){choose(currentChoices.indexOf(round[index].word)); nextQuestion();}`);
assert.equal(a.run('correct'),19);assert.equal(a.run('roundMistakes.length'),1);assert.equal(a.run('completed'),true);
assert.equal(a.els.get('round-mistakes').children.length,1);assert.equal(a.run('MistakeNotes.list().length'),1);
a.run('startRound()');assert.equal(a.run('roundMistakes.length'),0);assert.equal(a.run('MistakeNotes.list().length'),1);
const b=create();assert.equal(b.run('MistakeNotes.list().length'),1);assert.equal(b.els.get('saved-mistakes').children.length,1);
b.run(`const n=MistakeNotes.list()[0]; MistakeNotes.add(n,'another answer');`);assert.equal(b.run('MistakeNotes.list()[0].count'),2);assert.equal(b.run('MistakeNotes.list().length'),1);
b.run(`for(let n=0;n<20;n++){choose(currentChoices.indexOf(round[index].word)); nextQuestion();}`);
assert.equal(b.run('correct'),20);assert.equal(b.els.get('round-mistakes').children.length,0);assert.equal(b.run('MistakeNotes.list().length'),1);
const blocked=create({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
blocked.run(`choose(currentChoices.findIndex(w=>w!==round[index].word));`);assert.equal(blocked.run('MistakeNotes.list().length'),1);assert.ok(blocked.run('MistakeNotes.status()'));
const corrupt=create({getItem(){return 'invalid json'},setItem(){throw Error('Must not overwrite')}});assert.ok(corrupt.run('MistakeNotes.status()'));
console.log('PASS: round review; correct answers excluded; duplicate clicks ignored; persistence after reload; repeated-word counts; perfect-round review; unavailable/corrupt storage handled.');

