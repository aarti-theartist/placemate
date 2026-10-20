(() => {
  const API_URL = 'http://127.0.0.1:5000/chat';
  const TRACKER_KEY = 'placebuddyTracker';
  const trackerDefaults = {
    youtubeChapters: 0,
    udemyPercent: 5,
    analyticsLessons: 76
  };
  const trackerLimits = {
    youtubeChapters: 19,
    udemyPercent: 100,
    analyticsLessons: 219
  };
  const trackerLabels = {
    youtubeChapters: 'YouTube: OS + CN + OOPS + DBMS: Core CS Fundamentals in 1 Video',
    udemyPercent: 'Udemy course completion',
    analyticsLessons: 'CodeWithHarry Data Analytics course'
  };
  let history = [];
  let sending = false;
  let tracker = loadTracker();

  function loadTracker() {
    try {
      const saved = JSON.parse(localStorage.getItem(TRACKER_KEY));
      return Object.fromEntries(Object.entries(trackerDefaults).map(([key, fallback]) => {
        const value = Number(saved && saved[key]);
        return [key, Number.isFinite(value) ? Math.min(trackerLimits[key], Math.max(0, Math.round(value))) : fallback];
      }));
    } catch (error) {
      console.error('Could not load saved PlaceBuddy tracker values.', error);
      return { ...trackerDefaults };
    }
  }

  function saveTracker() {
    try {
      localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
    } catch (error) {
      console.error('Could not save PlaceBuddy tracker values.', error);
      setStatus('Could not save tracker on this device.');
    }
  }

  const launcher = document.createElement('button');
  launcher.className = 'placebuddy-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'placebuddyPanel');
  launcher.textContent = '💬 PlaceBuddy';

  const panel = document.createElement('section');
  panel.className = 'placebuddy-panel';
  panel.id = 'placebuddyPanel';
  panel.setAttribute('aria-label', 'PlaceBuddy placement assistant');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="placebuddy-header">
      <div><div class="placebuddy-title">PlaceBuddy</div><div class="placebuddy-subtitle">Placement &amp; Interview Assistant</div></div>
      <button class="placebuddy-icon-button" type="button" data-close aria-label="Close PlaceBuddy">×</button>
    </header>
    <div class="placebuddy-tabs" role="tablist" aria-label="PlaceBuddy sections">
      <button class="placebuddy-tab" type="button" role="tab" id="pbChatTab" aria-selected="true" aria-controls="pbChatView">Chat</button>
      <button class="placebuddy-tab" type="button" role="tab" id="pbTrackerTab" aria-selected="false" aria-controls="pbTrackerView">Learning Tracker</button>
    </div>
    <div class="placebuddy-chat-view" id="pbChatView" role="tabpanel" aria-labelledby="pbChatTab">
      <div class="placebuddy-messages" id="pbMessages" aria-live="polite" aria-relevant="additions text"></div>
      <div class="placebuddy-quick-starts" id="pbQuickStarts">
        <button type="button">Explain deadlock in OS</button>
        <button type="button">Start a mock interview</button>
        <button type="button">Aptitude practice</button>
        <button type="button">My progress</button>
      </div>
      <form class="placebuddy-composer" id="pbForm">
        <input id="pbInput" type="text" maxlength="1000" placeholder="Ask about placements or studies…" aria-label="Message PlaceBuddy" autocomplete="off">
        <button class="placebuddy-send" id="pbSend" type="submit">Send</button>
      </form>
      <div class="placebuddy-footer"><span class="placebuddy-typing" id="pbStatus" aria-live="polite"></span><button class="placebuddy-clear" type="button" id="pbClear">Clear chat</button></div>
    </div>
    <div class="placebuddy-tracker-view" id="pbTrackerView" role="tabpanel" aria-labelledby="pbTrackerTab" hidden>
      <p class="placebuddy-tracker-intro">Update your progress. PlaceBuddy receives these values with every message.</p>
      <div id="pbTrackerItems"></div>
    </div>`;

  document.body.append(launcher, panel);
  const messages = panel.querySelector('#pbMessages');
  const input = panel.querySelector('#pbInput');
  const status = panel.querySelector('#pbStatus');
  const sendButton = panel.querySelector('#pbSend');
  const chatTab = panel.querySelector('#pbChatTab');
  const trackerTab = panel.querySelector('#pbTrackerTab');
  const chatView = panel.querySelector('#pbChatView');
  const trackerView = panel.querySelector('#pbTrackerView');
  const trackerItems = panel.querySelector('#pbTrackerItems');

  function setStatus(message) {
    status.textContent = message;
  }

  function appendMessage(role, text) {
    const item = document.createElement('div');
    item.className = `placebuddy-message ${role}`;
    item.textContent = text;
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function setActiveTab(active) {
    const showChat = active === 'chat';
    chatTab.setAttribute('aria-selected', String(showChat));
    trackerTab.setAttribute('aria-selected', String(!showChat));
    chatView.hidden = !showChat;
    trackerView.hidden = showChat;
    if (!showChat) trackerItems.querySelector('input')?.focus();
  }

  function renderTracker() {
    trackerItems.replaceChildren();
    Object.entries(trackerDefaults).forEach(([key]) => {
      const item = document.createElement('div');
      item.className = 'placebuddy-tracker-item';
      const label = document.createElement('label');
      const inputId = `pbTracker-${key}`;
      label.htmlFor = inputId;
      label.textContent = trackerLabels[key];

      const controls = document.createElement('div');
      controls.className = 'placebuddy-tracker-controls';
      const field = document.createElement('input');
      field.id = inputId;
      field.type = 'number';
      field.min = '0';
      field.max = String(trackerLimits[key]);
      field.step = '1';
      field.value = String(tracker[key]);
      field.setAttribute('aria-label', `${trackerLabels[key]} progress`);
      const suffix = document.createElement('span');
      suffix.textContent = key === 'udemyPercent' ? 'percent complete' : `of ${trackerLimits[key]} ${key === 'youtubeChapters' ? 'chapters' : 'lessons'}`;
      controls.append(field, suffix);

      const progress = document.createElement('div');
      progress.className = 'placebuddy-progress';
      progress.setAttribute('role', 'progressbar');
      progress.setAttribute('aria-label', `${trackerLabels[key]} progress`);
      progress.setAttribute('aria-valuemin', '0');
      progress.setAttribute('aria-valuemax', String(trackerLimits[key]));
      const fill = document.createElement('span');
      progress.append(fill);

      function updateProgress() {
        const percent = tracker[key] / trackerLimits[key] * 100;
        fill.style.width = `${percent}%`;
        progress.setAttribute('aria-valuenow', String(tracker[key]));
      }
      field.addEventListener('change', () => {
        const parsed = Number(field.value);
        tracker[key] = Number.isFinite(parsed) ? Math.min(trackerLimits[key], Math.max(0, Math.round(parsed))) : 0;
        field.value = String(tracker[key]);
        updateProgress();
        saveTracker();
      });

      item.append(label, controls, progress);
      trackerItems.append(item);
      updateProgress();
    });
  }

  async function sendMessage(rawMessage) {
    if (sending) return;
    const message = rawMessage.trim();
    if (!message) {
      setStatus('Please enter a message.');
      input.focus();
      return;
    }
    if (message.length > 1000) {
      setStatus('Please keep your message under 1000 characters.');
      return;
    }

    appendMessage('user', message);
    input.value = '';
    setStatus('typing...');
    sending = true;
    sendButton.disabled = true;
    const sentHistory = history.slice(-20).map(({ role, content }) => ({ role, content }));
    history.push({ role: 'user', content: message });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: sentHistory, tracker: { ...tracker } })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'PlaceBuddy could not reply. Please try again.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('PlaceBuddy returned an empty reply. Please try again.');
      history.push({ role: 'assistant', content: data.reply });
      appendMessage('assistant', data.reply);
      setStatus('');
    } catch (error) {
      if (history.at(-1)?.role === 'user') history.pop();
      console.error('PlaceBuddy request failed.', error);
      setStatus(error instanceof TypeError ? 'Could not reach the server. Check that PlaceBuddy server is running.' : error.message);
    } finally {
      sending = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  launcher.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    launcher.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) input.focus();
  });
  panel.querySelector('[data-close]').addEventListener('click', () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  });
  panel.querySelector('#pbForm').addEventListener('submit', event => {
    event.preventDefault();
    void sendMessage(input.value);
  });
  panel.querySelector('#pbQuickStarts').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) void sendMessage(button.textContent);
  });
  panel.querySelector('#pbClear').addEventListener('click', () => {
    history = [];
    messages.replaceChildren();
    appendMessage('assistant', 'Hi! I’m PlaceBuddy. Ask me about core CS, aptitude, interviews, resumes, or your learning progress.');
    setStatus('Chat cleared.');
    input.focus();
  });
  chatTab.addEventListener('click', () => setActiveTab('chat'));
  trackerTab.addEventListener('click', () => setActiveTab('tracker'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }
  });

  renderTracker();
  appendMessage('assistant', 'Hi! I’m PlaceBuddy. Ask me about core CS, aptitude, interviews, resumes, or your learning progress.');
})();
