const CIRC = 2 * Math.PI * 52;
const el = id => document.getElementById(id);
const DEFAULT = { mode: 'focus', minutes: 25, running: false, endTime: 0, remaining: 25 * 60, sessions: 0, day: '', tasks: [] };
let state = { ...DEFAULT };
let tick = null;

const today = () => new Date().toDateString();
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const persist = () => chrome.storage.local.set({ state });

function currentRemaining() {
  return state.running ? Math.max(0, Math.round((state.endTime - Date.now()) / 1000)) : state.remaining;
}

function render() {
  const rem = currentRemaining();
  el('time').textContent = fmt(rem);
  const total = state.minutes * 60;
  el('bar').style.strokeDasharray = CIRC;
  el('bar').style.strokeDashoffset = CIRC * (1 - rem / total);
  el('startBtn').textContent = state.running ? 'Pause' : (rem < total ? 'Resume' : 'Start');
  el('sessions').textContent = state.sessions;
  document.body.classList.toggle('break', state.mode !== 'focus');
  document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
  document.title = state.running ? `${fmt(rem)} – FocusFlow` : 'FocusFlow';
  if (state.running && rem <= 0) finish();
}

let finishing = false;
function finish() {
  // The background alarm counts the session and sends the notification;
  // here we just stop ticking and re-sync from storage (avoids double counting).
  if (finishing) return;
  finishing = true;
  clearInterval(tick);
  setTimeout(() => {
    chrome.storage.local.get('state', data => {
      state = { ...DEFAULT, ...(data.state || {}) };
      state.running = false;
      finishing = false;
      render();
    });
  }, 1500);
}

function startLoop() {
  clearInterval(tick);
  tick = setInterval(render, 500);
}

function start() {
  const rem = currentRemaining() || state.minutes * 60;
  state.running = true;
  state.endTime = Date.now() + rem * 1000;
  persist();
  chrome.runtime.sendMessage({ type: 'START', endTime: state.endTime, mode: state.mode });
  startLoop();
  render();
}

function pause() {
  state.remaining = currentRemaining();
  state.running = false;
  persist();
  chrome.runtime.sendMessage({ type: 'STOP' });
  render();
}

function setMode(mode, minutes) {
  state.mode = mode;
  state.minutes = minutes;
  state.remaining = minutes * 60;
  state.running = false;
  persist();
  chrome.runtime.sendMessage({ type: 'STOP' });
  render();
}

el('startBtn').addEventListener('click', () => (state.running ? pause() : start()));
el('resetBtn').addEventListener('click', () => setMode(state.mode, state.minutes));
document.querySelectorAll('.mode').forEach(b =>
  b.addEventListener('click', () => setMode(b.dataset.mode, +b.dataset.min)));

/* ---------- Tasks ---------- */
function renderTasks() {
  const list = el('taskList');
  list.innerHTML = '';
  state.tasks.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.done) li.className = 'done';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.done;
    cb.addEventListener('change', () => { t.done = cb.checked; persist(); renderTasks(); });
    const span = document.createElement('span');
    span.textContent = t.text; // textContent prevents HTML injection
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Delete task');
    del.addEventListener('click', () => { state.tasks.splice(i, 1); persist(); renderTasks(); });
    li.append(cb, span, del);
    list.appendChild(li);
  });
  const left = state.tasks.filter(t => !t.done).length;
  el('taskCount').textContent = state.tasks.length ? `(${left} left)` : '';
  el('empty').style.display = state.tasks.length ? 'none' : 'block';
}

el('taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const text = el('taskInput').value.trim();
  if (!text) return;
  state.tasks.unshift({ text, done: false });
  el('taskInput').value = '';
  persist();
  renderTasks();
});

/* ---------- Init ---------- */
chrome.storage.local.get('state', data => {
  state = { ...DEFAULT, ...(data.state || {}) };
  if (state.day !== today()) { state.day = today(); state.sessions = 0; }
  renderTasks();
  render();
  if (state.running) startLoop();
});
