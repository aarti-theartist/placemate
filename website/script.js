/* ===== Helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ===== Theme ===== */
const themeBtn = $('#themeBtn');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  save('theme', t);
}
applyTheme(load('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.addEventListener('click', () =>
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ===== Mobile menu ===== */
const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== Scroll effects ===== */
const sections = $$('main section[id]');
addEventListener('scroll', () => {
  $('#navbar').classList.toggle('scrolled', scrollY > 10);
  $('#toTop').classList.toggle('show', scrollY > 500);
  const pos = scrollY + 120;
  sections.forEach(s => {
    const link = $(`#navLinks a[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight);
  });
});
$('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Animated counters ===== */
const counters = $$('[data-count]');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count;
    let n = 0;
    const step = Math.max(1, Math.ceil(end / 40));
    const id = setInterval(() => {
      n = Math.min(end, n + step);
      el.textContent = n + (end >= 100 ? '+' : '');
      if (n >= end) clearInterval(id);
    }, 30);
    io.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach(c => io.observe(c));

/* ===== Roadmap tabs ===== */
const roadmap = {
  dsa: { title: 'DSA & Coding', time: '⏱ 8–10 weeks · 2 hrs/day',
    items: ['Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Recursion & Backtracking', 'Trees & BST', 'Graphs (BFS/DFS)', 'Dynamic Programming', 'Sorting & Searching'] },
  apt: { title: 'Aptitude', time: '⏱ 4–6 weeks · 1 hr/day',
    items: ['Percentages & Ratios', 'Time, Speed & Distance', 'Profit & Loss', 'Permutation & Combination', 'Probability', 'Number Series', 'Logical Reasoning', 'Verbal Ability'] },
  hr: { title: 'HR & Soft Skills', time: '⏱ 2–3 weeks · 30 min/day',
    items: ['Tell me about yourself', 'Strengths & weaknesses', 'Teamwork stories (STAR)', 'Conflict handling', 'Career goals', 'Group discussion basics', 'Email & LinkedIn etiquette', 'Body language'] },
  res: { title: 'Resume & Projects', time: '⏱ 2 weeks · 1 hr/day',
    items: ['One-page ATS-friendly resume', 'Quantified achievements', '2–3 solid projects', 'GitHub profile cleanup', 'Portfolio website', 'LinkedIn headline', 'Certifications', 'Mock resume review'] }
};
function showTab(key) {
  const d = roadmap[key];
  $('#tabPanel').innerHTML = `<h3>${d.title}</h3><p class="meta">${d.time}</p><ul>${d.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === key));
}
$$('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
showTab('dsa');

/* ===== Tracker ===== */
const trackerData = {
  'DSA': ['Arrays', 'Linked List', 'Trees', 'Graphs', 'DP'],
  'Aptitude': ['Quant basics', 'Logical reasoning', 'Verbal', 'Data interpretation'],
  'Core CS': ['OOP', 'DBMS & SQL', 'Operating Systems', 'Computer Networks'],
  'Career': ['Resume ready', 'LinkedIn updated', 'Mock interview x3', 'Company research']
};
let done = load('tracker', {});
function renderTracker() {
  $('#trackerGrid').innerHTML = Object.entries(trackerData).map(([grp, items]) =>
    `<div class="track-box"><h4>${grp}</h4>${items.map(i => {
      const id = `${grp}-${i}`;
      return `<label class="check"><input type="checkbox" data-id="${id}" ${done[id] ? 'checked' : ''}><span>${i}</span></label>`;
    }).join('')}</div>`).join('');
  $$('#trackerGrid input').forEach(cb => cb.addEventListener('change', () => {
    done[cb.dataset.id] = cb.checked;
    save('tracker', done);
    updateProgress();
  }));
  updateProgress();
}
function updateProgress() {
  const all = Object.entries(trackerData).flatMap(([g, i]) => i.map(x => `${g}-${x}`));
  const pct = Math.round(all.filter(id => done[id]).length / all.length * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressText').textContent = pct + '% complete';
}
$('#resetTracker').addEventListener('click', () => {
  if (confirm('Reset all progress?')) { done = {}; save('tracker', done); renderTracker(); toast('Progress reset'); }
});
renderTracker();

/* ===== Quiz ===== */
const questions = [
  { q: 'What is the time complexity of binary search?', o: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], a: 1 },
  { q: 'Which data structure uses LIFO order?', o: ['Queue', 'Stack', 'Heap', 'Graph'], a: 1 },
  { q: 'A train 120 m long passes a pole in 6 s. Its speed is?', o: ['20 m/s', '30 m/s', '72 km/h only', '12 m/s'], a: 0 },
  { q: 'Find the next number: 2, 6, 12, 20, 30, ?', o: ['40', '42', '44', '36'], a: 1 },
  { q: 'Which SQL clause filters grouped results?', o: ['WHERE', 'ORDER BY', 'HAVING', 'LIMIT'], a: 2 },
  { q: 'Which is NOT an OOP pillar?', o: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], a: 2 },
  { q: 'Cost price ₹500, sold at ₹600. Profit %?', o: ['10%', '15%', '20%', '25%'], a: 2 },
  { q: 'Which traversal of a BST gives sorted output?', o: ['Preorder', 'Postorder', 'Level order', 'Inorder'], a: 3 },
  { q: 'Number of ways to arrange the letters of "CAT"?', o: ['3', '6', '9', '12'], a: 1 },
  { q: 'Which protocol is used to load web pages securely?', o: ['FTP', 'SMTP', 'HTTPS', 'SSH'], a: 2 }
];
let qi = 0, score = 0, answered = false;
function renderQ() {
  const q = questions[qi];
  answered = false;
  $('#qCount').textContent = `Question ${qi + 1}/${questions.length}`;
  $('#qScore').textContent = `Score: ${score}`;
  $('#qBar').style.width = (qi / questions.length * 100) + '%';
  $('#qText').textContent = q.q;
  $('#qFeedback').textContent = '';
  $('#qNext').disabled = true;
  $('#qNext').textContent = qi === questions.length - 1 ? 'Finish' : 'Next';
  const box = $('#qOptions');
  box.innerHTML = '';
  q.o.forEach((text, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = text;
    b.addEventListener('click', () => pick(i));
    box.appendChild(b);
  });
}
function pick(i) {
  if (answered) return;
  answered = true;
  const q = questions[qi], btns = $$('.opt');
  btns.forEach(b => b.disabled = true);
  btns[q.a].classList.add('correct');
  if (i === q.a) { score++; $('#qFeedback').textContent = '✅ Correct!'; }
  else { btns[i].classList.add('wrong'); $('#qFeedback').textContent = '❌ Not quite — see the green answer.'; }
  $('#qScore').textContent = `Score: ${score}`;
  $('#qNext').disabled = false;
}
$('#qNext').addEventListener('click', () => {
  qi++;
  if (qi < questions.length) return renderQ();
  const best = Math.max(load('bestScore', 0), score);
  save('bestScore', best);
  $('#quizCard').innerHTML = `<div class="result"><p>Quiz complete</p><div class="big">${score}/${questions.length}</div>
    <p>${score >= 8 ? '🔥 Excellent work!' : score >= 5 ? '👍 Good, keep practising.' : '📚 Revise the basics and retry.'}</p>
    <p style="color:var(--muted);margin:8px 0 18px">Best score: ${best}/${questions.length}</p>
    <button class="btn primary" id="retry">Retry quiz</button></div>`;
  $('#retry').addEventListener('click', () => location.reload());
});
renderQ();

/* ===== Mock interview ===== */
const mock = [
  ['Technical', 'Explain the difference between a process and a thread.'],
  ['Technical', 'What is normalization in DBMS? Why is it needed?'],
  ['Technical', 'How does a HashMap work internally?'],
  ['Technical', 'Explain REST APIs and common HTTP methods.'],
  ['Technical', 'What happens when you type a URL in the browser?'],
  ['HR', 'Tell me about yourself.'],
  ['HR', 'Why should we hire you?'],
  ['HR', 'Describe a time you failed and what you learned.'],
  ['HR', 'Where do you see yourself in five years?'],
  ['Project', 'Walk me through your best project and your role in it.'],
  ['Project', 'What was the hardest bug you fixed in a project?'],
  ['Project', 'How would you scale your project to 1 million users?']
];
let timerId = null, left = 120;
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
function resetTimer() {
  clearInterval(timerId); timerId = null; left = 120;
  $('#mockTimer').textContent = fmt(left);
  $('#mockTimer').classList.remove('low');
}
$('#newQ').addEventListener('click', () => {
  const [c, q] = mock[Math.floor(Math.random() * mock.length)];
  $('#mockCat').textContent = c;
  $('#mockQ').textContent = q;
  resetTimer();
});
$('#startT').addEventListener('click', () => {
  if (timerId) return;
  timerId = setInterval(() => {
    left--;
    $('#mockTimer').textContent = fmt(left);
    $('#mockTimer').classList.toggle('low', left <= 15);
    if (left <= 0) { clearInterval(timerId); timerId = null; toast("⏰ Time's up!"); }
  }, 1000);
});
$('#stopT').addEventListener('click', resetTimer);

/* ===== Resources ===== */
const resources = [
  { t: 'coding', n: 'LeetCode', d: 'Practice DSA problems by topic and company.', u: 'https://leetcode.com' },
  { t: 'coding', n: 'GeeksforGeeks', d: 'Concept articles and interview experiences.', u: 'https://www.geeksforgeeks.org' },
  { t: 'coding', n: 'HackerRank', d: 'Skill tests and certifications recruiters see.', u: 'https://www.hackerrank.com' },
  { t: 'aptitude', n: 'IndiaBIX', d: 'Aptitude and reasoning practice sets.', u: 'https://www.indiabix.com' },
  { t: 'aptitude', n: 'PrepInsta', d: 'Company-wise aptitude and coding prep.', u: 'https://prepinsta.com' },
  { t: 'interview', n: 'Pramp', d: 'Free peer-to-peer mock interviews.', u: 'https://www.pramp.com' },
  { t: 'interview', n: 'InterviewBit', d: 'Guided interview preparation roadmap.', u: 'https://www.interviewbit.com' },
  { t: 'coding', n: 'NeetCode', d: 'Curated roadmap with video explanations.', u: 'https://neetcode.io' }
];
function renderRes(f = 'all') {
  $('#resCards').innerHTML = resources.filter(r => f === 'all' || r.t === f).map(r =>
    `<a class="card" href="${r.u}" target="_blank" rel="noopener"><span class="tag">${r.t}</span><h4>${r.n}</h4><p>${r.d}</p></a>`).join('');
}
$$('.chip').forEach(c => c.addEventListener('click', () => {
  $$('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  renderRes(c.dataset.f);
}));
renderRes();

/* ===== Contact form ===== */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#cName').value.trim(), email = $('#cEmail').value.trim(), msg = $('#cMsg').value.trim();
  const err = $('#formError');
  if (name.length < 2) return (err.textContent = 'Please enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (err.textContent = 'Please enter a valid email.');
  if (msg.length < 10) return (err.textContent = 'Message should be at least 10 characters.');
  err.textContent = '';
  e.target.reset();
  toast('✅ Message sent (demo)');
});
