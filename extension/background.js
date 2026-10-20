// Service worker: keeps the timer alive when the popup is closed.
const ALARM = 'focusflow-end';
const BADGE = 'focusflow-badge';

function updateBadge(endTime) {
  const mins = Math.max(0, Math.ceil((endTime - Date.now()) / 60000));
  chrome.action.setBadgeText({ text: String(mins) });
  chrome.action.setBadgeBackgroundColor({ color: '#7c6cff' });
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'START') {
    chrome.alarms.create(ALARM, { when: msg.endTime });
    chrome.alarms.create(BADGE, { periodInMinutes: 1 });
    updateBadge(msg.endTime);
  }
  if (msg.type === 'STOP') {
    chrome.alarms.clear(ALARM);
    chrome.alarms.clear(BADGE);
    chrome.action.setBadgeText({ text: '' });
  }
});

chrome.alarms.onAlarm.addListener(async alarm => {
  const { state } = await chrome.storage.local.get('state');
  if (!state) return;

  if (alarm.name === BADGE && state.running) {
    updateBadge(state.endTime);
  }

  if (alarm.name === ALARM) {
    chrome.alarms.clear(BADGE);
    chrome.action.setBadgeText({ text: '' });
    const wasFocus = state.mode === 'focus';
    if (wasFocus) state.sessions = (state.sessions || 0) + 1;
    state.running = false;
    state.remaining = state.minutes * 60;
    await chrome.storage.local.set({ state });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: wasFocus ? 'Focus session complete! 🎉' : 'Break is over ⏰',
      message: wasFocus ? 'Great work. Take a short break.' : 'Ready for the next focus session?'
    });
  }
});
