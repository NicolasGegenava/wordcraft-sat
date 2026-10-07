'use strict';
const ROUND_SIZE = 20;
const $ = id => document.getElementById(id);
function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const stopWords = new Set('a an the to of in on for with and or by as at from that this be is are someone something one usually very having person especially relating act quality state'.split(' '));
function stems(text) {
  return new Set((text.toLowerCase().match(/[a-z]+/g) || []).filter(w => w.length > 2 && !stopWords.has(w)).map(w => w.replace(/(ing|ness|tion|ed|es|s)$/,'')));
}
const signatures = new Map(VOCAB.map(e => [e.word, stems(e.definition)]));
// Exclude closely related answers even when their definitions use different synonyms.
const synonymGroups = [
 'ostracism banishment', 'captivate enthrall beguile enchant', 'putrid rancid fetid noisome',
 'insular reclusive', 'abate diminish mitigate allay assuage alleviate palliate',
 'amiable amicable affable genial cordial convivial', 'abhor detest loathe',
 'benevolent benign munificent magnanimous', 'cajole coax blandish',
 'lucid pellucid limpid', 'capacious commodious', 'concise succinct pithy terse',
 'audacious brazen bold temerity', 'mundane banal hackneyed trite prosaic',
 'enervate debilitate', 'exculpate exonerate vindicate absolve', 'mollify placate appease pacify',
 'garrulous verbose loquacious', 'malevolent malicious inimical', 'obdurate obstinate intransigent adamant',
 'ephemeral transient evanescent', 'opaque obscure abstruse arcane esoteric',
 'latent dormant', 'profligate prodigal', 'veracity candor probity', 'rectitude probity',
 'censure rebuke reprimand reprove reproach chide chastise admonish', 'venerate revere',
 'dearth paucity', 'copious profuse abundant', 'servile obsequious', 'astute acute canny shrewd',
 'sagacity perspicacity acumen', 'mendacious fallacious', 'mutable protean mercurial',
 'assiduous diligent meticulous', 'daunting intimidating', 'concord accord harmony consensus',
 'infamy notoriety', 'fervent zealous ardent', 'impassive stoic stolid',
 'lethargic torpid languid', 'onerous burdensome', 'scathing caustic acerbic',
 'egregious flagrant', 'rancor acrimony', 'inane fatuous vacuous',
 'disparate heterogeneous', 'emaciated gaunt', 'audacious intrepid',
 'commensurate tantamount', 'accede acquiesce consent', 'arbitrary capricious',
 'deride disparage denigrate vilify', 'haughty imperious', 'odious execrable abhorrent',
 'avarice cupidity', 'pugnacious contentious', 'wily crafty cunning', 'truculent belligerent',
 'preclude forestall', 'resolute adamant', 'pliable malleable tractable', 'quell suppress',
 'quagmire morass', 'grandiloquence bombast', 'decorous seemly', 'sacrosanct hallowed',
 'alacrity eagerness', 'erudite learned', 'neophyte novice', 'dissemble feign',
 'desecrate profane', 'portent presage', 'laudatory complimentary', 'pallid pale',
 'encomium accolade acclaim approbation commendation adulation plaudits',
 'remiss negligent', 'solicitous attentive', 'dour morose', 'mawkish maudlin',
 'wistful nostalgic', 'rife prevalent pervasive ubiquitous', 'wanton licentious',
 'frugal parsimonious', 'clandestine covert surreptitious furtive'
].map(s => new Set(s.split(' ')));
function related(a, b) {
  if (a.word === b.word) return true;
  if (synonymGroups.some(g => g.has(a.word) && g.has(b.word))) return true;
  if (a.definition.toLowerCase().includes(b.word) || b.definition.toLowerCase().includes(a.word)) return true;
  const left = signatures.get(a.word), right = signatures.get(b.word);
  return [...left].some(s => right.has(s));
}
function makeChoices(entry) {
  // The source contains only one adverb; use three unambiguous adverb distractors for it.
  if (entry.pos === 'adv') return shuffle([entry.word, 'quietly', 'reluctantly', 'casually']);
  const pool = VOCAB.filter(other => other.pos === entry.pos && !related(entry, other));
  if (pool.length < 3) throw new Error('Insufficient distinct choices');
  return shuffle([entry.word, ...shuffle(pool).slice(0, 3).map(e => e.word)]);
}
let deck = [], round = [], index = 0, correct = 0, answered = false, completed = false, currentChoices = [];
let roundMistakes = [];
function renderMistakes(target, notes, saved = false) {
  target.replaceChildren();
  for (const note of notes) {
    const item = document.createElement('li');
    const definition = document.createElement('p'); definition.className = 'note-definition';
    definition.textContent = `${saved ? '' : `Question ${note.question}: `}(${note.pos}.) ${note.definition}`;
    const answers = document.createElement('p'); answers.className = 'note-answers';
    const answer = document.createElement('strong'); answer.textContent = note.word;
    answers.append(document.createTextNode('Correct word: '),answer,document.createTextNode(` · Your ${saved ? 'last ' : ''}answer: ${note.chosen}`));
    item.append(definition,answers);
    if (saved) { const meta=document.createElement('p'); meta.className='note-meta';meta.textContent=`Missed ${note.count} ${note.count===1?'time':'times'} · Last missed ${new Date(note.date).toLocaleDateString()}`;item.append(meta); }
    target.append(item);
  }
}
function renderNotes() {
  const notes=MistakeNotes.list();
  $('notes-count').textContent=notes.length;
  $('notes-empty').hidden=notes.length>0;
  $('notes-status').textContent=MistakeNotes.status() || 'Saved in this browser, including after you close the page. Notes do not sync to other devices.';
  renderMistakes($('saved-mistakes'),notes,true);
  if(MistakeNotes.status()) $('saved-notes').open=true;
}
function takeWords(count) {
  const selected = [];
  while (selected.length < count) {
    if (!deck.length) deck = shuffle(VOCAB);
    const next = deck.pop();
    if (!selected.some(e => e.word === next.word)) selected.push(next);
  }
  return selected;
}
function startRound() {
  round = takeWords(ROUND_SIZE); index = 0; correct = 0; completed = false;
  roundMistakes = [];
  $('question-view').hidden = false; $('result-view').hidden = true;
  renderQuestion();
}
function renderQuestion() {
  answered = false; const entry = round[index]; currentChoices = makeChoices(entry);
  $('question-count').innerHTML = `Question ${index + 1} <span>of ${ROUND_SIZE}</span>`;
  $('score').textContent = `${correct} correct`;
  $('progress-fill').style.width = `${index / ROUND_SIZE * 100}%`;
  document.querySelector('.progress').setAttribute('aria-valuenow', index);
  $('definition').replaceChildren();
  const pos = document.createElement('span'); pos.className = 'pos'; pos.textContent = `(${entry.pos}.) `;
  $('definition').append(pos, document.createTextNode(entry.definition));
  $('choices').replaceChildren();
  currentChoices.forEach((word,i) => {
    const button = document.createElement('button'); button.className = 'choice'; button.type = 'button';
    const letter = document.createElement('span'); letter.className = 'choice-letter'; letter.textContent = 'ABCD'[i]; letter.setAttribute('aria-hidden','true');
    const label = document.createElement('span'); label.className = 'choice-word'; label.textContent = word;
    button.append(letter,label); button.setAttribute('aria-label',`${'ABCD'[i]}. ${word}`);
    button.addEventListener('click',() => choose(i)); $('choices').append(button);
  });
  $('feedback').textContent = 'Choose the word that matches.'; $('feedback').className = '';
  $('next').disabled = true; $('next').textContent = index === ROUND_SIZE - 1 ? 'See results' : 'Next question';
}
function choose(choiceIndex) {
  if (answered || completed) return;
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex > 3) throw new Error('Choose a number from 1 to 4.');
  answered = true; const answer = round[index].word; const chosen = currentChoices[choiceIndex];
  const isCorrect = chosen === answer; if (isCorrect) correct++;
  if (!isCorrect) {
    roundMistakes.push({...round[index],chosen,question:index+1});
    MistakeNotes.add(round[index],chosen);
    renderNotes();
  }
  [...$('choices').children].forEach((button,i) => {
    button.disabled = true; const word = currentChoices[i];
    button.classList.add(word === answer ? 'correct' : i === choiceIndex ? 'wrong' : 'dimmed');
    if (word === answer || i === choiceIndex) {
      const status = document.createElement('span'); status.className = 'answer-status';status.textContent = word === answer ? '✓' : '×'; status.setAttribute('aria-hidden','true');button.append(status);
      button.setAttribute('aria-label',`${word}. ${word === answer ? 'Correct answer' : 'Incorrect answer'}`);
    }
  });
  $('feedback').className = isCorrect ? 'success' : 'error';
  $('feedback').textContent = isCorrect ? 'Correct. Nicely done!' : `Not quite. The answer is ${answer}.`;
  $('score').textContent = `${correct} correct`; $('next').disabled = false;
  $('progress-fill').style.width = `${(index+1) / ROUND_SIZE * 100}%`;
  document.querySelector('.progress').setAttribute('aria-valuenow', index+1);
  $('next').focus({preventScroll:true});
}
function nextQuestion() {
  if (!answered || completed) return;
  if (index === ROUND_SIZE - 1) { finish(); return; }
  index++; renderQuestion(); $('definition').focus({preventScroll:true});
}
function finish() {
  completed = true; $('question-view').hidden = true; $('result-view').hidden = false;
  $('question-count').textContent = 'Round complete'; $('final-score').textContent = correct;
  $('result-title').textContent = correct === 20 ? 'A perfect round.' : correct >= 15 ? 'Nicely done.' : 'Keep building your vocabulary.';
  $('result-message').textContent = `${Math.round(correct / ROUND_SIZE * 100)}% accuracy. Ready for 20 more words?`;
  $('review-summary').textContent = roundMistakes.length
    ? `${roundMistakes.length} missed ${roundMistakes.length===1?'question':'questions'}. ${MistakeNotes.status() ? 'Review them below; browser saving is unavailable.' : 'Added to your missed-word notes below.'}`
    : 'No missed questions this round. Your earlier notes are still saved below.';
  renderMistakes($('round-mistakes'),roundMistakes);
  $('restart').focus({preventScroll:true});
}
$('next').addEventListener('click', nextQuestion);
$('restart').addEventListener('click', () => { startRound(); $('definition').focus({preventScroll:true}); });
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (/^[1-4]$/.test(event.key) && !completed) { event.preventDefault(); choose(Number(event.key)-1); }
  if (event.key === 'Enter' && answered && !completed) { event.preventDefault(); nextQuestion(); }
});
$('bank-count').textContent = `${VOCAB.length} words to explore`;
renderNotes();
startRound();
// Optional agent access mirrors the visible quiz and never returns an unrevealed answer.
const context = document.modelContext;
if (context?.registerTool) {
  const lifecycle = new AbortController();
  const state = () => ({completed, question:index+1, total:ROUND_SIZE, correct, answered,
    ...(completed ? {} : {definition:$('definition').textContent, choices:[...currentChoices]})});
  const tools = [
    {name:'read_vocabulary_question',description:'Read the visible quiz question and choices without revealing the answer.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:state},
    {name:'answer_vocabulary_question',description:'Submit one of the four choices and show the answer feedback.',inputSchema:{type:'object',properties:{choice:{type:'integer',minimum:1,maximum:4}},required:['choice'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!Number.isInteger(input.choice)||input.choice<1||input.choice>4)throw new Error('choice must be 1, 2, 3, or 4');if(answered||completed)throw new Error('This question is already complete');choose(input.choice-1);return {...state(),feedback:$('feedback').textContent};}},
    {name:'continue_vocabulary_quiz',description:'Move past answered feedback, or start a new round after the results.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{if(completed)startRound();else if(answered)nextQuestion();else throw new Error('Answer the current question first');return state();}}
  ];
  for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
