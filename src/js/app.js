const STORAGE_KEY = 'focuspulse_v2_state';
const PRESETS = {
  quick: { focus: 15, short: 3, long: 8 },
  classic: { focus: 25, short: 5, long: 15 },
  deep: { focus: 40, short: 8, long: 20 },
  flow: { focus: 50, short: 10, long: 25 },
  epic: { focus: 90, short: 20, long: 30 }
};

const RANDOM_TASKS = {
  id: [
    { text: 'Rapikan 10 file di laptop', tag: 'Life' },
    { text: 'Belajar satu konsep coding selama 15 menit', tag: 'Code' },
    { text: 'Tulis tiga prioritas untuk besok', tag: 'Study' },
    { text: 'Baca lima halaman buku', tag: 'Study' },
    { text: 'Rapikan meja selama lima menit', tag: 'Life' },
    { text: 'Buat mini project tanpa tutorial', tag: 'Code' },
    { text: 'Catat satu ide project yang unik', tag: 'Creative' },
    { text: 'Review catatan kuliah hari ini', tag: 'Study' },
    { text: 'Backup satu folder penting', tag: 'Life' },
    { text: 'Coba shortcut keyboard baru', tag: 'Random' },
    { text: 'Buat desain kecil dengan tema fantasy', tag: 'Creative' },
    { text: 'Selesaikan satu bug kecil yang tertunda', tag: 'Code' }
  ],
  en: [
    { text: 'Organize 10 files on your laptop', tag: 'Life' },
    { text: 'Learn one coding concept for 15 minutes', tag: 'Code' },
    { text: 'Write three priorities for tomorrow', tag: 'Study' },
    { text: 'Read five pages of a book', tag: 'Study' },
    { text: 'Tidy your desk for five minutes', tag: 'Life' },
    { text: 'Build a tiny project without a tutorial', tag: 'Code' },
    { text: 'Write down one unusual project idea', tag: 'Creative' },
    { text: "Review today's study notes", tag: 'Study' },
    { text: 'Back up one important folder', tag: 'Life' },
    { text: 'Learn a new keyboard shortcut', tag: 'Random' },
    { text: 'Make a small fantasy-themed design', tag: 'Creative' },
    { text: 'Finish one small delayed bug', tag: 'Code' }
  ]
};

const defaultState = {
  timer: {
    mode: 'focus',
    durations: { focus: 25, short: 5, long: 15 },
    timeLeft: 25 * 60,
    isRunning: false,
    sessions: 0,
    intervalId: null
  },
  tasks: [],
  habits: [
    { id: 1, name: 'Minum air', completed: false },
    { id: 2, name: 'Baca 5 halaman', completed: false },
    { id: 3, name: 'Rapikan meja', completed: false }
  ],
  activeTaskId: null,
  streak: 0,
  lastActivityDate: '',
  habitDate: localDateKey(),
  ambient: { type: 'rain', volume: 35, playing: false }
};

let state = clone(defaultState);
let audioContext = null;
let ambientNodes = [];
let toastTimer = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function localDateKey(date) {
  const value = date || new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
  });
}

function safeId(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : Date.now();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return;

    if (saved.timer && saved.timer.durations) {
      ['focus', 'short', 'long'].forEach(function (mode) {
        const duration = Number(saved.timer.durations[mode]);
        if (duration >= 1 && duration <= 180) state.timer.durations[mode] = duration;
      });
      state.timer.sessions = Math.max(0, Number(saved.timer.sessions) || 0);
    }

    if (Array.isArray(saved.tasks)) {
      state.tasks = saved.tasks.slice(0, 100).map(function (task) {
        return {
          id: safeId(task.id),
          text: String(task.text || '').slice(0, 100),
          tag: String(task.tag || 'Random').slice(0, 20),
          completed: Boolean(task.completed)
        };
      }).filter(function (task) { return task.text; });
    }

    if (Array.isArray(saved.habits)) {
      state.habits = saved.habits.slice(0, 20).map(function (habit) {
        return {
          id: safeId(habit.id),
          name: String(habit.name || '').slice(0, 60),
          completed: Boolean(habit.completed)
        };
      }).filter(function (habit) { return habit.name; });
    }

    state.activeTaskId = saved.activeTaskId == null ? null : safeId(saved.activeTaskId);
    state.streak = Math.max(0, Number(saved.streak) || 0);
    state.lastActivityDate = typeof saved.lastActivityDate === 'string' ? saved.lastActivityDate : '';
    state.habitDate = typeof saved.habitDate === 'string' ? saved.habitDate : localDateKey();

    if (saved.ambient) {
      state.ambient.type = String(saved.ambient.type || 'rain');
      state.ambient.volume = Math.min(100, Math.max(0, Number(saved.ambient.volume) || 0));
    }
  } catch (error) {
    console.warn('Could not load saved FocusPulse data.', error);
  }

  if (state.habitDate !== localDateKey()) {
    state.habits.forEach(function (habit) { habit.completed = false; });
    state.habitDate = localDateKey();
  }

  if (state.lastActivityDate && state.lastActivityDate !== localDateKey() && state.lastActivityDate !== yesterdayKey()) {
    state.streak = 0;
  }

  state.timer.mode = 'focus';
  state.timer.timeLeft = state.timer.durations.focus * 60;
  state.timer.isRunning = false;
  state.timer.intervalId = null;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timer: { durations: state.timer.durations, sessions: state.timer.sessions },
      tasks: state.tasks,
      habits: state.habits,
      activeTaskId: state.activeTaskId,
      streak: state.streak,
      lastActivityDate: state.lastActivityDate,
      habitDate: state.habitDate,
      ambient: { type: state.ambient.type, volume: state.ambient.volume }
    }));
  } catch (error) {
    console.warn('Could not save FocusPulse data.', error);
  }
}

function recordActivity() {
  const today = localDateKey();
  if (state.lastActivityDate === today) return;
  state.streak = state.lastActivityDate === yesterdayKey() ? state.streak + 1 : 1;
  state.lastActivityDate = today;
  saveState();
  updateStreak();
}

function updateStreak() {
  const element = document.getElementById('streak-count');
  if (element) element.textContent = String(state.streak);
}

function setTimerMode(mode) {
  if (!state.timer.durations[mode]) return;
  pauseTimer(false);
  state.timer.mode = mode;
  state.timer.timeLeft = state.timer.durations[mode] * 60;
  updateTimerUI();
}

function toggleTimer() {
  if (state.timer.isRunning) pauseTimer(true);
  else startTimer();
}

function startTimer() {
  if (state.timer.isRunning) return;
  state.timer.isRunning = true;
  state.timer.intervalId = window.setInterval(function () {
    state.timer.timeLeft = Math.max(0, state.timer.timeLeft - 1);
    updateTimerUI();
    if (state.timer.timeLeft === 0) completeTimer();
  }, 1000);
  updateTimerUI();
}

function pauseTimer(showPaused) {
  window.clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.isRunning = false;
  updateTimerUI(showPaused ? 'paused' : null);
}

function resetTimer() {
  pauseTimer(false);
  state.timer.timeLeft = state.timer.durations[state.timer.mode] * 60;
  updateTimerUI();
}

function skipTimer() {
  const next = state.timer.mode === 'focus' ? 'short' : 'focus';
  setTimerMode(next);
}

function completeTimer() {
  pauseTimer(false);
  playChime();

  if (state.timer.mode === 'focus') {
    state.timer.sessions += 1;
    recordActivity();
    showToast(t('focusComplete'));
    setTimerMode(state.timer.sessions % 4 === 0 ? 'long' : 'short');
  } else {
    showToast(t('breakComplete'));
    setTimerMode('focus');
  }
  saveState();
  updateAllUI();
}

function updateTimerUI(forcedStatus) {
  const minutes = Math.floor(state.timer.timeLeft / 60);
  const seconds = state.timer.timeLeft % 60;
  const display = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  const durationSeconds = state.timer.durations[state.timer.mode] * 60;
  const progress = durationSeconds ? state.timer.timeLeft / durationSeconds : 0;

  const displayElement = document.getElementById('timer-display');
  const ring = document.getElementById('timer-progress-ring');
  const label = document.getElementById('timer-toggle-label');
  const icon = document.getElementById('timer-toggle-icon');
  const status = document.getElementById('timer-status');

  if (displayElement) displayElement.textContent = display;
  if (ring) ring.style.strokeDashoffset = String(729 - 729 * progress);
  if (label) label.textContent = state.timer.isRunning ? t('pause') : t('start');
  if (icon) icon.setAttribute('data-lucide', state.timer.isRunning ? 'pause' : 'play');

  if (status) {
    if (forcedStatus === 'paused') status.textContent = t('paused');
    else if (state.timer.isRunning) status.textContent = state.timer.mode === 'focus' ? t('running') : t('breakRunning');
    else status.textContent = t('ready');
  }

  ['focus', 'short', 'long'].forEach(function (mode) {
    const tab = document.getElementById('mode-' + mode);
    if (tab) tab.classList.toggle('active', state.timer.mode === mode);
  });

  const counter = document.getElementById('session-counter');
  if (counter) counter.textContent = state.timer.sessions + ' ' + t('sessions');
  document.title = display + ' — FocusPulse';
  refreshIcons();
}

function applyPreset(name) {
  if (name === 'custom') return;
  const preset = PRESETS[name];
  if (!preset) return;
  state.timer.durations = clone(preset);
  syncDurationInputs();
  setTimerMode(state.timer.mode);
  saveState();
}

function saveCustomDurations() {
  const focus = clampDuration(document.getElementById('duration-focus').value, 25, 180);
  const shortBreak = clampDuration(document.getElementById('duration-short').value, 5, 60);
  const longBreak = clampDuration(document.getElementById('duration-long').value, 15, 90);
  state.timer.durations = { focus: focus, short: shortBreak, long: longBreak };
  const preset = document.getElementById('preset-select');
  if (preset) preset.value = 'custom';
  setTimerMode(state.timer.mode);
  saveState();
  showToast(t('durationsSaved'));
}

function clampDuration(value, fallback, maximum) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(1, number)) : fallback;
}

function syncDurationInputs() {
  document.getElementById('duration-focus').value = state.timer.durations.focus;
  document.getElementById('duration-short').value = state.timer.durations.short;
  document.getElementById('duration-long').value = state.timer.durations.long;
  const presetName = Object.keys(PRESETS).find(function (key) {
    return JSON.stringify(PRESETS[key]) === JSON.stringify(state.timer.durations);
  });
  document.getElementById('preset-select').value = presetName || 'custom';
}

function addTask(event) {
  event.preventDefault();
  const input = document.getElementById('task-input');
  const tag = document.getElementById('task-tag');
  const text = input.value.trim();
  if (!text) return;
  state.tasks.unshift({ id: Date.now(), text: text, tag: tag.value, completed: false });
  input.value = '';
  saveState();
  renderTasks();
}

function addRandomTask() {
  const pool = RANDOM_TASKS[currentLang] || RANDOM_TASKS.id;
  const used = new Set(state.tasks.map(function (task) { return task.text; }));
  const available = pool.filter(function (task) { return !used.has(task.text); });
  const source = available.length ? available : pool;
  const task = source[Math.floor(Math.random() * source.length)];
  state.tasks.unshift({ id: Date.now(), text: task.text, tag: task.tag, completed: false });
  saveState();
  renderTasks();
  showToast(t('taskAdded'));
}

function toggleTask(id) {
  const task = state.tasks.find(function (item) { return item.id === id; });
  if (!task) return;
  task.completed = !task.completed;
  if (task.completed) recordActivity();
  saveState();
  renderTasks();
}

function setActiveTask(id) {
  state.activeTaskId = state.activeTaskId === id ? null : id;
  saveState();
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(function (task) { return task.id !== id; });
  if (state.activeTaskId === id) state.activeTaskId = null;
  saveState();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-tasks');
  if (!list || !empty) return;
  list.innerHTML = '';
  empty.hidden = state.tasks.length > 0;

  state.tasks.forEach(function (task) {
    const row = document.createElement('div');
    row.className = 'task-row' + (task.completed ? ' completed' : '');
    row.innerHTML =
      '<button class="task-check" onclick="toggleTask(' + task.id + ')" aria-label="Toggle task"><i data-lucide="check"></i></button>' +
      '<div class="task-copy"><span class="task-title">' + escapeHtml(task.text) + '</span><span class="task-tag">' + escapeHtml(task.tag) + '</span></div>' +
      '<button class="focus-button' + (state.activeTaskId === task.id ? ' active' : '') + '" onclick="setActiveTask(' + task.id + ')">' +
      (state.activeTaskId === task.id ? t('active') : t('focusAction')) + '</button>' +
      '<button class="delete-button" onclick="deleteTask(' + task.id + ')" aria-label="' + t('delete') + '"><i data-lucide="trash-2"></i></button>';
    list.appendChild(row);
  });

  const active = state.tasks.find(function (task) { return task.id === state.activeTaskId; });
  const activeName = document.getElementById('active-task-name');
  if (activeName) activeName.textContent = active ? active.text : t('noneSelected');
  refreshIcons();
}

function addHabit(event) {
  event.preventDefault();
  const input = document.getElementById('habit-input');
  const name = input.value.trim();
  if (!name) return;
  state.habits.push({ id: Date.now(), name: name, completed: false });
  input.value = '';
  saveState();
  renderHabits();
}

function toggleHabit(id) {
  const habit = state.habits.find(function (item) { return item.id === id; });
  if (!habit) return;
  habit.completed = !habit.completed;
  if (habit.completed) recordActivity();
  saveState();
  renderHabits();
}

function deleteHabit(id) {
  state.habits = state.habits.filter(function (habit) { return habit.id !== id; });
  saveState();
  renderHabits();
}

function renderHabits() {
  const list = document.getElementById('habits-list');
  const progress = document.getElementById('habit-progress');
  if (!list || !progress) return;
  list.innerHTML = '';

  state.habits.forEach(function (habit) {
    const row = document.createElement('div');
    row.className = 'habit-row' + (habit.completed ? ' completed' : '');
    row.innerHTML =
      '<button class="habit-check" onclick="toggleHabit(' + habit.id + ')" aria-label="Toggle habit"><i data-lucide="check"></i></button>' +
      '<span class="habit-name">' + escapeHtml(habit.name) + '</span>' +
      '<button class="delete-button" onclick="deleteHabit(' + habit.id + ')" aria-label="' + t('delete') + '"><i data-lucide="trash-2"></i></button>';
    list.appendChild(row);
  });

  const completed = state.habits.filter(function (habit) { return habit.completed; }).length;
  progress.textContent = completed + '/' + state.habits.length;
  refreshIcons();
}

function toggleAmbient() {
  state.ambient.playing = !state.ambient.playing;
  if (state.ambient.playing) {
    startAmbient();
    showToast(t('ambientOn'));
  } else {
    stopAmbient();
    showToast(t('ambientOff'));
  }
  updateAmbientUI();
}

function setAmbientType(type) {
  state.ambient.type = type;
  saveState();
  if (state.ambient.playing) {
    stopAmbient();
    startAmbient();
  }
  updateAmbientUI();
}

function setAmbientVolume(value) {
  state.ambient.volume = Math.min(100, Math.max(0, Number(value) || 0));
  if (audioContext && ambientNodes.master) {
    ambientNodes.master.gain.setTargetAtTime(state.ambient.volume / 250, audioContext.currentTime, 0.04);
  }
  saveState();
  updateAmbientUI();
}

function ensureAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function createNoiseBuffer(context, type) {
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    if (type === 'brown' || type === 'fireplace') {
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.5;
    } else if (type === 'pink' || type === 'rain' || type === 'forest' || type === 'library' || type === 'night') {
      last = 0.985 * last + 0.15 * white;
      data[index] = last * 0.35;
    } else {
      data[index] = white * 0.55;
    }
    if (type === 'fireplace' && Math.random() < 0.0008) data[index] += (Math.random() * 2 - 1) * 1.7;
  }
  return buffer;
}

function startAmbient() {
  try {
    stopAmbient();
    const context = ensureAudioContext();
    const type = state.ambient.type;
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const source = context.createBufferSource();
    const settings = {
      rain: ['lowpass', 1800, 0.5], forest: ['bandpass', 900, 0.7], fireplace: ['lowpass', 700, 0.6],
      ocean: ['lowpass', 500, 0.8], wind: ['bandpass', 650, 1.1], night: ['lowpass', 1100, 0.5],
      library: ['lowpass', 420, 0.7], white: ['allpass', 1000, 0], pink: ['lowpass', 2400, 0.4],
      brown: ['lowpass', 500, 0.5]
    }[type] || ['lowpass', 1200, 0.5];

    source.buffer = createNoiseBuffer(context, type);
    source.loop = true;
    filter.type = settings[0];
    filter.frequency.value = settings[1];
    filter.Q.value = settings[2];
    master.gain.value = state.ambient.volume / 250;

    source.connect(filter);
    filter.connect(master);
    master.connect(context.destination);
    source.start();

    ambientNodes = [source, filter, master];
    ambientNodes.master = master;

    if (type === 'ocean' || type === 'wind') {
      const lfo = context.createOscillator();
      const depth = context.createGain();
      lfo.frequency.value = type === 'ocean' ? 0.09 : 0.17;
      depth.gain.value = state.ambient.volume / 600;
      lfo.connect(depth);
      depth.connect(master.gain);
      lfo.start();
      ambientNodes.push(lfo, depth);
    }
  } catch (error) {
    state.ambient.playing = false;
    console.warn('Ambient audio is unavailable.', error);
  }
}

function stopAmbient() {
  ambientNodes.forEach(function (node) {
    try {
      if (typeof node.stop === 'function') node.stop();
      if (typeof node.disconnect === 'function') node.disconnect();
    } catch (error) {}
  });
  ambientNodes = [];
}

function updateAmbientUI() {
  const selector = document.getElementById('ambient-select');
  const slider = document.getElementById('volume-slider');
  const value = document.getElementById('volume-value');
  const icon = document.getElementById('ambient-icon');
  const toggle = document.getElementById('ambient-toggle');

  if (selector) selector.value = state.ambient.type;
  if (slider) slider.value = String(state.ambient.volume);
  if (value) value.textContent = state.ambient.volume + '%';
  if (icon) icon.setAttribute('data-lucide', state.ambient.playing ? 'volume-2' : 'volume-x');
  if (toggle) toggle.classList.toggle('active', state.ambient.playing);
  refreshIcons();
}

function playChime() {
  try {
    const context = ensureAudioContext();
    [523.25, 659.25, 783.99].forEach(function (frequency, index) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.12;
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.72);
    });
  } catch (error) {}
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 2200);
}

function updateAllUI() {
  updateStreak();
  updateTimerUI();
  updateAmbientUI();
  renderTasks();
  renderHabits();
}

window.addEventListener('DOMContentLoaded', function () {
  loadState();
  syncDurationInputs();
  document.getElementById('ambient-select').value = state.ambient.type;
  document.getElementById('volume-slider').value = String(state.ambient.volume);
  window.focusPulseReady = true;
  updateAllUI();
});

window.addEventListener('beforeunload', function () {
  pauseTimer(false);
  stopAmbient();
  saveState();
});
