import { categories, demoMessages } from './categories.js';
import { exportCSV } from './engine.js';
const $ = id => document.getElementById(id);
let worker, ready = false, busy = false, rows = [], filter = 'all';
const editors = categories.map(category => {
  const section = document.createElement('section');
  const heading = document.createElement('h3'); heading.textContent = category.name;
  const label = document.createElement('label'); label.textContent = 'Example messages · one per line'; label.htmlFor = `examples-${category.id}`;
  const examples = document.createElement('textarea'); examples.id = label.htmlFor; examples.rows = 4; examples.value = category.examples.join('\n'); examples.maxLength = 3000;
  const nextLabel = document.createElement('label'); nextLabel.textContent = 'Next step for you to check'; nextLabel.htmlFor = `action-${category.id}`;
  const action = document.createElement('input'); action.id = nextLabel.htmlFor; action.value = category.action; action.maxLength = 200;
  section.append(heading, label, examples, nextLabel, action); $('categories').append(section);
  return { ...category, examplesElement: examples, actionElement: action };
});
function setBusy(value) {
  busy = value; $('sort').disabled = value || !ready; $('load').disabled = value || ready;
  $('demo').disabled = value; $('clear').disabled = value; $('messages').disabled = value; $('export').disabled = value || !rows.length;
  for (const editor of editors) { editor.examplesElement.disabled = value; editor.actionElement.disabled = value; }
}
function render() {
  $('results').replaceChildren();
  const shown = rows.filter(row => filter === 'all' || row.reviewed === 'review');
  $('total').textContent = rows.length; $('review').textContent = rows.filter(row => row.reviewed === 'review').length;
  for (const row of shown) {
    const card = document.createElement('article'); card.className = 'result';
    const head = document.createElement('div'); head.className = 'resulthead';
    const badge = document.createElement('span'); badge.className = 'badge' + (row.reviewed === 'review' ? ' review' : '');
    badge.textContent = row.reviewed === 'review' ? 'Needs review' : categories.find(c => c.id === row.reviewed).name;
    const select = document.createElement('select'); select.setAttribute('aria-label', `Review category for message ${rows.indexOf(row) + 1}`);
    for (const choice of [{id:'review',name:'Needs review'}, ...categories.filter(c=>c.id !== 'review')]) { const option = document.createElement('option'); option.value = choice.id; option.textContent = choice.name; select.append(option); }
    select.value = row.reviewed; select.onchange = () => { row.reviewed = select.value; render(); };
    head.append(badge, select);
    const message = document.createElement('p'); message.className = 'message'; message.textContent = row.message;
    const explanation = document.createElement('div'); explanation.className = 'explanation';
    const first = row.scores[0];
    const details = [
      `AI suggestion: ${row.review ? 'Needs review' : first.name} · ${row.reason}`,
      `Nearest: ${first.name} (${first.score.toFixed(3)}) · Runner-up: ${row.scores[1].name} (${row.scores[1].score.toFixed(3)})`,
      `Closest example: “${first.example}”`,
      `Suggested next step: ${row.reviewed === 'review' ? 'Read the message and choose the right category.' : row.scores.find(s => s.id === row.reviewed).action}`
    ];
    for (const text of details) { const line = document.createElement('div'); line.textContent = text; explanation.append(line); }
    card.append(head, message, explanation); $('results').append(card);
  }
  if (!shown.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = rows.length ? 'No messages need review in this view.' : 'Add messages and run the AI to start your queue.'; $('results').append(p); }
  $('export').disabled = busy || !rows.length;
}
$('demo').onclick = () => { $('messages').value = demoMessages.join('\n'); $('status').textContent = 'Six synthetic messages loaded. No customer data is used.'; };
$('clear').onclick = () => { $('messages').value = ''; rows = []; $('timing').textContent = '—'; render(); $('status').textContent = 'Messages and results cleared from this tab.'; };
$('load').onclick = () => {
  setBusy(true); $('modelstatus').textContent = 'Downloading local model…'; $('status').textContent = 'First load may take a few minutes. Keep this tab open.';
  worker?.terminate(); worker = new Worker(new URL('./worker.js', import.meta.url), {type:'module'});
  worker.onerror = () => { ready = false; setBusy(false); $('modelstatus').textContent = 'Model could not load'; $('status').textContent = 'Check your internet connection and browser support, then retry loading the AI.'; };
  worker.onmessage = ({data}) => {
    if (data.type === 'progress') $('modelstatus').textContent = `${data.file}: ${data.progress}%`;
    if (data.type === 'ready') { ready = true; setBusy(false); $('load').textContent = 'AI ready ✓'; $('modelstatus').textContent = 'Ready · running on your device'; $('status').textContent = 'Ready to sort. Your messages will stay in this tab.'; }
    if (data.type === 'processing') $('status').textContent = `Sorting locally: ${data.done} of ${data.total} messages…`;
    if (data.type === 'error') { setBusy(false); $('status').textContent = `Could not finish: ${data.message}`; if (!ready) $('modelstatus').textContent = 'Load failed · retry available'; }
    if (data.type === 'results') { rows = data.results.map(row => ({...row, reviewed:row.category, suggested:row.category, score:row.scores[0].score})); $('timing').textContent = `${(data.elapsed/1000).toFixed(1)}s`; setBusy(false); render(); $('status').textContent = 'Sorted locally. Check suggestions before exporting or acting on them.'; }
  };
  worker.postMessage({type:'load'});
};
$('sort').onclick = () => {
  const messages = $('messages').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!messages.length || messages.length > 30 || messages.some(s => s.length > 500)) { $('status').textContent = 'Enter 1–30 messages, each no longer than 500 characters.'; return; }
  const current = editors.map(editor => ({id:editor.id,name:editor.name,action:editor.actionElement.value.trim(),examples:editor.examplesElement.value.split('\n').map(s=>s.trim()).filter(Boolean)}));
  if (current.some(c=>!c.examples.length || c.examples.length>8 || c.examples.some(s=>s.length>300))) { $('status').textContent = 'Each category needs 1–8 short examples (up to 300 characters each).'; return; }
  setBusy(true); $('status').textContent = 'Comparing messages with your examples locally…';
  worker.postMessage({type:'classify',messages,categories:current});
};
document.querySelectorAll('.filter').forEach(button => button.onclick = () => { filter = button.dataset.filter; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button)); if (rows.length) render(); });
$('export').onclick = () => {
  const file = new Blob([exportCSV(rows)], {type:'text/csv;charset=utf-8'}); const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = 'replyqueue-reviewed.csv'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
};
