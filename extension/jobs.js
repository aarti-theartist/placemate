/* ===== Job Match: resume -> skills -> role -> job suggestions ===== */
(function () {
  const $ = id => document.getElementById(id);

  // Skill dictionary: canonical name -> aliases (matched as whole words, case-insensitive)
  const SKILLS = {
    'Python': ['python'], 'Java': ['java'], 'JavaScript': ['javascript', 'js', 'es6'],
    'TypeScript': ['typescript'], 'C++': ['c++'], 'C': ['c programming'], 'C#': ['c#'],
    'HTML': ['html', 'html5'], 'CSS': ['css', 'css3'], 'React': ['react', 'reactjs', 'react.js'],
    'Angular': ['angular'], 'Vue': ['vue', 'vuejs'], 'Node.js': ['node', 'nodejs', 'node.js'],
    'Express': ['express', 'expressjs'], 'PHP': ['php'], 'Django': ['django'], 'Flask': ['flask'],
    'Spring Boot': ['spring', 'spring boot', 'springboot'], 'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite'],
    'MongoDB': ['mongodb', 'mongo'], 'Firebase': ['firebase'], 'Git': ['git', 'github'],
    'Android': ['android', 'kotlin'], 'Flutter': ['flutter', 'dart'],
    'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn'],
    'Deep Learning': ['deep learning', 'tensorflow', 'pytorch', 'keras', 'neural network'],
    'Data Analysis': ['data analysis', 'pandas', 'numpy', 'excel', 'power bi', 'tableau', 'data visualization'],
    'NLP': ['nlp', 'natural language processing'], 'Prompt Engineering': ['prompt engineering', 'llm', 'generative ai', 'chatgpt'],
    'AWS': ['aws', 'amazon web services'], 'Azure': ['azure'], 'Docker': ['docker'], 'Kubernetes': ['kubernetes', 'k8s'],
    'Linux': ['linux'], 'DevOps': ['devops', 'ci/cd', 'jenkins'],
    'Testing': ['testing', 'selenium', 'junit', 'manual testing', 'qa'], 'Cybersecurity': ['cybersecurity', 'security', 'ethical hacking', 'networking'],
    'UI/UX': ['ui/ux', 'figma', 'ux', 'ui design', 'wireframe'], 'REST API': ['rest', 'rest api', 'api']
  };

  // Role profiles: which skills point to which job role
  const ROLES = [
    { role: 'Web Developer', q: 'web developer', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue', 'Node.js', 'PHP', 'TypeScript', 'Express'] },
    { role: 'Python Developer', q: 'python developer', skills: ['Python', 'Django', 'Flask', 'REST API', 'SQL'] },
    { role: 'Java Developer', q: 'java developer', skills: ['Java', 'Spring Boot', 'SQL', 'REST API'] },
    { role: 'Data Analyst', q: 'data analyst', skills: ['Data Analysis', 'SQL', 'Python'] },
    { role: 'Machine Learning Engineer', q: 'machine learning', skills: ['Machine Learning', 'Deep Learning', 'NLP', 'Python', 'Prompt Engineering'] },
    { role: 'Android Developer', q: 'android developer', skills: ['Android', 'Flutter', 'Java', 'Firebase'] },
    { role: 'DevOps / Cloud Engineer', q: 'devops engineer', skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'DevOps'] },
    { role: 'QA / Test Engineer', q: 'qa engineer', skills: ['Testing', 'Java', 'Python'] },
    { role: 'Cybersecurity Analyst', q: 'security analyst', skills: ['Cybersecurity', 'Linux'] },
    { role: 'UI/UX Designer', q: 'ui ux designer', skills: ['UI/UX', 'HTML', 'CSS'] }
  ];

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function extractSkills(text) {
    const t = ' ' + text.toLowerCase() + ' ';
    const found = [];
    for (const [name, aliases] of Object.entries(SKILLS)) {
      const hit = aliases.some(a => {
        const re = new RegExp('(^|[^a-z0-9+#])' + escapeRe(a) + '($|[^a-z0-9+#])', 'i');
        return re.test(t);
      });
      if (hit) found.push(name);
    }
    return found;
  }

  function rankRoles(skills) {
    const set = new Set(skills);
    return ROLES.map(r => ({ ...r, score: r.skills.filter(s => set.has(s)).length / Math.sqrt(r.skills.length) }))
      .filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }

  const stripHtml = h => (h || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const safeUrl = u => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };

  function scoreJob(job, skills) {
    const hay = (job.title + ' ' + (job.tags || []).join(' ') + ' ' + stripHtml(job.description)).toLowerCase();
    let hits = 0;
    skills.forEach(s => (SKILLS[s] || []).some(a => hay.includes(a.toLowerCase())) && hits++);
    return skills.length ? Math.min(99, Math.round((hits / Math.min(skills.length, 8)) * 100)) : 0;
  }

  async function fetchJobs(query) {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=20&search=' + encodeURIComponent(query));
    if (!res.ok) throw new Error('Job service returned ' + res.status);
    const data = await res.json();
    return Array.isArray(data.jobs) ? data.jobs : [];
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderJobs(jobs, skills) {
    const box = $('jobList');
    box.innerHTML = '';
    jobs.forEach(j => {
      const card = el('div', 'job');
      const top = el('div', 'job-top');
      const left = el('div');
      left.append(el('div', 'job-title', j.title), el('div', 'job-co', j.company_name));
      const pct = j.match;
      top.append(left, el('span', 'match ' + (pct >= 60 ? '' : pct >= 30 ? 'mid' : 'low'), pct + '% match'));
      const meta = el('div', 'job-meta',
        [j.job_type && j.job_type.replace('_', ' '), j.candidate_required_location || 'Remote'].filter(Boolean).join(' · '));
      const href = safeUrl(j.url);
      card.append(top, meta);
      if (href) {
        const a = el('a', 'apply', 'Apply here →');
        a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
        card.append(a);
      }
      box.append(card);
    });
  }

  function renderSearchLinks(role) {
    const q = encodeURIComponent(role.q);
    const slug = role.q.replace(/\s+/g, '-');
    const box = $('searchLinks');
    box.innerHTML = '';
    box.append(el('h4', '', 'Search more ' + role.role + ' jobs in India'));
    [
      ['LinkedIn', 'https://www.linkedin.com/jobs/search/?keywords=' + q + '&location=India'],
      ['Naukri', 'https://www.naukri.com/' + slug + '-jobs'],
      ['Indeed', 'https://in.indeed.com/jobs?q=' + q + '&l=India']
    ].forEach(([n, u]) => {
      const a = el('a', '', n + ' ↗');
      a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
      box.append(a);
    });
    box.hidden = false;
  }

  function setStatus(msg, err) {
    const s = $('jobStatus');
    s.textContent = msg;
    s.classList.toggle('err', !!err);
  }

  async function findJobs() {
    const text = $('resumeText').value.trim();
    $('jobList').innerHTML = '';
    $('skillChips').innerHTML = '';
    $('searchLinks').hidden = true;
    if (text.length < 40) return setStatus('Please paste more of your resume (at least a few lines).', true);

    chrome.storage.local.set({ resume: text });
    const skills = extractSkills(text);
    if (!skills.length) return setStatus('No known tech skills found. Add a Skills section to your resume.', true);
    skills.slice(0, 14).forEach(s => $('skillChips').append(el('span', 'chip', s)));

    const roles = rankRoles(skills);
    const role = roles[0] || ROLES[0];
    renderSearchLinks(role);
    setStatus('Best fit: ' + role.role + '. Searching live remote jobs…');

    try {
      let jobs = await fetchJobs(role.q);
      if (!jobs.length && skills[0]) jobs = await fetchJobs(skills[0]);
      jobs.forEach(j => (j.match = scoreJob(j, skills)));
      jobs.sort((a, b) => b.match - a.match);
      jobs = jobs.slice(0, 6);
      if (!jobs.length) return setStatus('Best fit: ' + role.role + '. No live remote jobs right now; use the search links below.');
      setStatus('Best fit: ' + role.role + ' · top ' + jobs.length + ' remote matches');
      renderJobs(jobs, skills);
    } catch (e) {
      setStatus('Could not load live jobs (' + e.message + '). Use the search links below.', true);
    }
  }

  /* ----- wiring ----- */
  $('findJobs').addEventListener('click', findJobs);
  $('resumeFile').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 500000) return setStatus('File too large. Paste the text instead.', true);
    const r = new FileReader();
    r.onload = () => { $('resumeText').value = String(r.result).slice(0, 20000); setStatus('Loaded ' + f.name); };
    r.readAsText(f);
  });

  document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(x => x.classList.toggle('active', x === b));
    $('view-focus').hidden = b.dataset.view !== 'focus';
    $('view-jobs').hidden = b.dataset.view !== 'jobs';
  }));

  chrome.storage.local.get('resume', d => { if (d.resume) $('resumeText').value = d.resume; });
})();
