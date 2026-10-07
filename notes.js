'use strict';
const MistakeNotes = (() => {
  const key = 'wordcraft.mistakes.v1';
  let entries = [], error = '', blocked = false;
  const valid = n => n && ['word','pos','definition','chosen','date'].every(k=>typeof n[k]==='string') && Number.isInteger(n.count) && n.count>0;
  function read() {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(valid)) throw new Error('Invalid notes');
    return parsed;
  }
  try { entries = read(); } catch {
    blocked = true; error = 'Saved notes could not be loaded. New mistakes will stay visible for this visit, but cannot be saved. Existing stored notes have not been replaced.';
  }
  function add(entry, chosen) {
    // Read the latest browser copy before updating, preserving notes from another tab.
    if (!blocked && !error) { try { entries = read(); } catch { blocked = true; } }
    const existing = entries.find(n=>n.word===entry.word);
    const note = {word:entry.word,pos:entry.pos,definition:entry.definition,chosen,date:new Date().toISOString(),count:(existing?.count||0)+1};
    entries = [note,...entries.filter(n=>n.word!==entry.word)];
    if (!blocked) {
      try { localStorage.setItem(key,JSON.stringify(entries)); error=''; }
      catch { error='Notes could not be saved in this browser. Keep this page open to review the mistakes from this visit.'; }
    } else { error='Notes could not be saved in this browser. Keep this page open to review the mistakes from this visit.'; }
    return note;
  }
  return {add,list:()=>entries.map(n=>({...n})),status:()=>error};
})();
