const STORAGE_KEY = 'focuspulse_v2_state';
const PRESETS = {
  micro: { name:'Micro Reset', description:'A tiny reset when starting feels difficult.', focus:10, short:2, long:5 },
  quick: { name:'Quick Sprint', description:'Fast momentum for small tasks.', focus:15, short:3, long:8 },
  classic: { name:'Classic Pomodoro', description:'The balanced default for everyday focus.', focus:25, short:5, long:15 },
  deep: { name:'Deep Work', description:'Longer blocks for coding and studying.', focus:40, short:8, long:20 },
  flow: { name:'Flow State', description:'Stay immersed with fewer interruptions.', focus:50, short:10, long:25 },
  ultradian: { name:'52 / 17', description:'A research-inspired work and recovery rhythm.', focus:52, short:17, long:25 },
  maker: { name:'Maker Mode', description:'A long runway for difficult creative work.', focus:75, short:15, long:25 },
  epic: { name:'Epic Quest', description:'Maximum deep-focus expedition.', focus:90, short:20, long:30 }
};

const AMBIENTS = [
  { id:'rain', name:'Castle Rain', icon:'cloud-rain', category:'nature', color:'#70b9ff', description:{id:'Hujan lembut di balik jendela batu tua.',en:'Soft rain beyond old stone windows.'} },
  { id:'thunder', name:'Distant Thunder', icon:'cloud-lightning', category:'nature', color:'#8d91ff', description:{id:'Gemuruh rendah dari badai yang jauh.',en:'Low rumbles from a faraway storm.'} },
  { id:'forest', name:'Enchanted Forest', icon:'trees', category:'nature', color:'#69d39a', description:{id:'Angin dan dedaunan di hutan yang tenang.',en:'Wind and leaves in a quiet forest.'} },
  { id:'ocean', name:'Mystic Ocean', icon:'waves', category:'nature', color:'#50d1e8', description:{id:'Ombak panjang dengan ritme yang menenangkan.',en:'Long waves with a calming rhythm.'} },
  { id:'river', name:'Crystal River', icon:'waves-arrow-up', category:'nature', color:'#67d9ff', description:{id:'Aliran air jernih yang terus bergerak.',en:'A clear stream in constant motion.'} },
  { id:'wind', name:'Mountain Wind', icon:'wind', category:'nature', color:'#b6d8e8', description:{id:'Hembusan udara tipis di puncak tinggi.',en:'Thin air moving across a high summit.'} },
  { id:'night', name:'Moonlit Night', icon:'moon-star', category:'nature', color:'#9ca8ff', description:{id:'Suasana malam sunyi dan luas.',en:'A quiet and spacious night atmosphere.'} },
  { id:'fireplace', name:'Tavern Fireplace', icon:'flame-kindling', category:'places', color:'#ff9b57', description:{id:'Api hangat dengan letupan kayu kecil.',en:'Warm fire with gentle wooden crackles.'} },
  { id:'library', name:'Ancient Library', icon:'library-big', category:'places', color:'#d7b47b', description:{id:'Ruangan sunyi, halaman buku, dan udara lembut.',en:'A hushed room of pages and soft air.'} },
  { id:'cafe', name:'Quiet Café', icon:'coffee', category:'places', color:'#e4a873', description:{id:'Dengung kafe yang halus tanpa distraksi.',en:'A soft café hum without the distraction.'} },
  { id:'tavern', name:'Fantasy Tavern', icon:'beer', category:'places', color:'#f5bd62', description:{id:'Keramaian hangat yang terasa jauh.',en:'Warm distant bustle in a cozy hall.'} },
  { id:'clockwork', name:'Clockwork Room', icon:'settings', category:'places', color:'#f2d05f', description:{id:'Mesin kecil dan ritme mekanis yang stabil.',en:'Tiny machinery and a steady mechanical rhythm.'} },
  { id:'train', name:'Night Train', icon:'train-front', category:'places', color:'#c19375', description:{id:'Getaran gerbong dalam perjalanan malam.',en:'Carriage vibration through a night journey.'} },
  { id:'fan', name:'Soft Fan', icon:'fan', category:'noise', color:'#a8d4df', description:{id:'Dengung stabil untuk menutup suara sekitar.',en:'A steady hum that masks the room.'} },
  { id:'white', name:'White Noise', icon:'audio-waveform', category:'noise', color:'#e8edf2', description:{id:'Spektrum penuh untuk menutupi distraksi.',en:'Full-spectrum sound to mask distractions.'} },
  { id:'pink', name:'Pink Noise', icon:'audio-lines', category:'noise', color:'#ff9fcb', description:{id:'Noise seimbang yang terasa lebih lembut.',en:'Balanced noise with a softer texture.'} },
  { id:'brown', name:'Brown Noise', icon:'activity', category:'noise', color:'#c18b6a', description:{id:'Nada rendah dan dalam untuk fokus tenang.',en:'Deep low tones for grounded focus.'} },
  { id:'space', name:'Deep Space', icon:'orbit', category:'noise', color:'#8b7cff', description:{id:'Dengung luas seperti kabin antariksa.',en:'A wide hum like a distant space cabin.'} }
];

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
    totalFocusSeconds: 0,
    statsDate: localDateKey(),
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
let ambientFilterValue = 'all';

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
      state.timer.totalFocusSeconds = Math.max(0, Number(saved.timer.totalFocusSeconds) || 0);
      state.timer.statsDate = typeof saved.timer.statsDate === 'string' ? saved.timer.statsDate : localDateKey();
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

  if (state.timer.statsDate !== localDateKey()) {
    state.timer.totalFocusSeconds = 0;
    state.timer.statsDate = localDateKey();
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
      timer: { durations: state.timer.durations, sessions: state.timer.sessions, totalFocusSeconds: state.timer.totalFocusSeconds, statsDate: state.timer.statsDate },
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
    if (state.timer.mode === 'focus') {
      state.timer.totalFocusSeconds += 1;
      if (state.timer.totalFocusSeconds % 15 === 0) saveState();
      updatePulseUI();
    }
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
  if (ring) ring.style.strokeDashoffset = String(829.4 - 829.4 * progress);
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

  const counter = document.getElementById('header-session-count');
  if (counter) counter.textContent = String(state.timer.sessions);
  document.title = display + ' — FocusPulse';
  refreshIcons();
}

function currentPresetName() {
  return Object.keys(PRESETS).find(function(key) {
    const preset = PRESETS[key];
    return preset.focus === state.timer.durations.focus &&
      preset.short === state.timer.durations.short &&
      preset.long === state.timer.durations.long;
  }) || 'custom';
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.timer.durations = { focus:preset.focus, short:preset.short, long:preset.long };
  syncDurationInputs();
  setTimerMode(state.timer.mode);
  saveState();
  renderPresetPicker();
}

function saveCustomDurations() {
  const focus = clampDuration(document.getElementById('duration-focus').value, 25, 180);
  const shortBreak = clampDuration(document.getElementById('duration-short').value, 5, 60);
  const longBreak = clampDuration(document.getElementById('duration-long').value, 15, 90);
  state.timer.durations = { focus: focus, short: shortBreak, long: longBreak };
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
}

function renderPresetPicker() {
  const grid = document.getElementById('preset-card-grid');
  if (!grid) return;
  const selected = currentPresetName();
  grid.innerHTML = '';
  Object.keys(PRESETS).forEach(function(key) {
    const preset = PRESETS[key];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-card' + (selected === key ? ' selected' : '');
    button.onclick = function() { applyPreset(key); };
    button.innerHTML =
      '<header><span>' + preset.focus + ' / ' + preset.short + '</span><i class="preset-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4L19 6"/></svg></i></header>' +
      '<strong>' + preset.name + '</strong><small>' + preset.description + ' · ' + preset.long + ' min long break</small>';
    grid.appendChild(button);
  });
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
  updatePulseUI();
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

function getAmbient(type) {
  return AMBIENTS.find(function(item) { return item.id === type; }) || AMBIENTS[0];
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

function setAmbientType(type, autoplay) {
  const ambient = getAmbient(type);
  state.ambient.type = ambient.id;
  if (autoplay === true) state.ambient.playing = true;
  saveState();
  if (state.ambient.playing) {
    stopAmbient();
    startAmbient();
  }
  updateAmbientUI();
  renderAmbientPicker();
}

function selectAmbientFromStudio(type) {
  setAmbientType(type, true);
}

function applyThemeAmbient(theme) {
  if (!theme || !theme.defaultAmbient) return;
  setAmbientType(theme.defaultAmbient, state.ambient.playing);
}

function setAmbientVolume(value) {
  state.ambient.volume = Math.min(100, Math.max(0, Number(value) || 0));
  if (audioContext && ambientNodes.master) {
    ambientNodes.master.gain.setTargetAtTime(state.ambient.volume / 250, audioContext.currentTime, 0.04);
  }
  saveState();
  updateAmbientUI();
}

function filterAmbient(category, clickedButton) {
  ambientFilterValue = category;
  document.querySelectorAll('#ambient-filter button').forEach(function(button) {
    button.classList.toggle('active', button === clickedButton);
  });
  document.querySelectorAll('.ambient-card').forEach(function(card) {
    card.hidden = category !== 'all' && card.dataset.category !== category;
  });
}

function renderAmbientPicker() {
  const grid = document.getElementById('ambient-card-grid');
  if (!grid) return;
  const theme = typeof getCurrentTheme === 'function' ? getCurrentTheme() : { recommended:[] };
  grid.innerHTML = '';
  AMBIENTS.forEach(function(ambient) {
    const recommended = theme.recommended.indexOf(ambient.id) !== -1;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.category = ambient.category;
    button.hidden = ambientFilterValue !== 'all' && ambient.category !== ambientFilterValue;
    button.className = 'ambient-card' + (state.ambient.type === ambient.id ? ' selected' : '');
    button.style.setProperty('--sound-color', ambient.color);
    button.onclick = function() { selectAmbientFromStudio(ambient.id); };
    button.innerHTML =
      '<span class="ambient-card-icon"><i data-lucide="' + ambient.icon + '"></i></span>' +
      '<strong>' + ambient.name + '</strong>' +
      (recommended ? '<span class="recommended-star" title="' + t('recommended') + '"><i data-lucide="star"></i></span>' : '<span></span>') +
      '<small>' + ambient.description[currentLang] + '</small>';
    grid.appendChild(button);
  });
  refreshIcons();
}

function ensureAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function createNoiseBuffer(context, type) {
  const length = context.sampleRate * 5;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  let slow = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    if (['brown','fireplace','train','thunder','space'].indexOf(type) !== -1) {
      last = (last + 0.018 * white) / 1.018;
      data[index] = last * 3.2;
    } else if (['pink','rain','forest','library','night','cafe','tavern'].indexOf(type) !== -1) {
      last = 0.984 * last + 0.14 * white;
      data[index] = last * 0.34;
    } else if (type === 'river' || type === 'ocean' || type === 'wind') {
      slow = 0.996 * slow + 0.05 * white;
      data[index] = slow * 0.28 + white * 0.08;
    } else {
      data[index] = white * 0.5;
    }
    if (type === 'fireplace' && Math.random() < 0.00075) data[index] += (Math.random() * 2 - 1) * 1.8;
    if (type === 'clockwork' && index % Math.floor(context.sampleRate * 0.55) < 90) data[index] += 0.65 * Math.sin(index * 0.18);
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
      rain:['lowpass',1900,.5], thunder:['lowpass',220,.8], forest:['bandpass',1050,.7],
      ocean:['lowpass',480,.8], river:['bandpass',1200,.45], wind:['bandpass',690,1.1],
      night:['lowpass',900,.5], fireplace:['lowpass',720,.6], library:['lowpass',390,.7],
      cafe:['bandpass',620,.5], tavern:['bandpass',520,.6], clockwork:['bandpass',1450,1.5],
      train:['lowpass',430,.8], fan:['bandpass',720,1.2], white:['allpass',1000,0],
      pink:['lowpass',2300,.4], brown:['lowpass',470,.5], space:['lowpass',320,.9]
    }[type] || ['lowpass',1200,.5];

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

    if (['ocean','river','wind','train','thunder'].indexOf(type) !== -1) {
      const lfo = context.createOscillator();
      const depth = context.createGain();
      lfo.frequency.value = type === 'thunder' ? 0.035 : type === 'train' ? 1.8 : type === 'river' ? 0.22 : 0.1;
      depth.gain.value = state.ambient.volume / (type === 'thunder' ? 850 : 650);
      lfo.connect(depth);
      depth.connect(master.gain);
      lfo.start();
      ambientNodes.push(lfo, depth);
    }

    if (type === 'space' || type === 'clockwork') {
      const hum = context.createOscillator();
      const humGain = context.createGain();
      hum.type = type === 'space' ? 'sine' : 'triangle';
      hum.frequency.value = type === 'space' ? 58 : 110;
      humGain.gain.value = state.ambient.volume / 1800;
      hum.connect(humGain);
      humGain.connect(master);
      hum.start();
      ambientNodes.push(hum, humGain);
    }
  } catch (error) {
    state.ambient.playing = false;
    console.warn('Ambient audio is unavailable.', error);
  }
}

function stopAmbient() {
  ambientNodes.forEach(function(node) {
    try {
      if (typeof node.stop === 'function') node.stop();
      if (typeof node.disconnect === 'function') node.disconnect();
    } catch (error) {}
  });
  ambientNodes = [];
}

function updateAmbientUI() {
  const ambient = getAmbient(state.ambient.type);
  const mainSlider = document.getElementById('volume-slider');
  const studioSlider = document.getElementById('studio-volume-slider');
  const mainValue = document.getElementById('volume-value');
  const studioValue = document.getElementById('studio-volume-value');
  const icon = document.getElementById('ambient-icon');
  const largeIcon = document.getElementById('ambient-large-icon');
  const name = document.getElementById('current-ambient-name');
  const description = document.getElementById('current-ambient-description');
  const panel = document.querySelector('.ambient-panel');
  const visual = document.getElementById('ambient-visual');

  if (mainSlider) mainSlider.value = String(state.ambient.volume);
  if (studioSlider) studioSlider.value = String(state.ambient.volume);
  if (mainValue) mainValue.textContent = state.ambient.volume + '%';
  if (studioValue) studioValue.textContent = state.ambient.volume + '%';
  if (icon) icon.setAttribute('data-lucide', state.ambient.playing ? 'pause' : 'play');
  if (largeIcon) largeIcon.setAttribute('data-lucide', ambient.icon);
  if (name) name.textContent = ambient.name;
  if (description) description.textContent = ambient.description[currentLang];
  if (panel) panel.classList.toggle('playing', state.ambient.playing);
  if (visual) visual.style.setProperty('--ambient-color', ambient.color);
  renderAmbientPicker();
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

function updatePulseUI() {
  const completedTasks = state.tasks.filter(function(task) { return task.completed; }).length;
  const taskCount = document.getElementById('completed-task-count');
  const focusMinutes = document.getElementById('focus-minutes');
  const pulseBar = document.getElementById('today-pulse-bar');
  if (taskCount) taskCount.textContent = String(completedTasks);
  if (focusMinutes) focusMinutes.textContent = String(Math.floor(state.timer.totalFocusSeconds / 60));
  if (pulseBar) {
    const score = Math.min(100, 18 + completedTasks * 13 + state.timer.sessions * 18);
    pulseBar.style.setProperty('--h', score + '%');
  }
}

function updateAllUI() {
  updateStreak();
  updateTimerUI();
  updateAmbientUI();
  renderTasks();
  renderHabits();
  renderPresetPicker();
  updatePulseUI();
}

window.addEventListener('DOMContentLoaded', function () {
  loadState();
  syncDurationInputs();
  window.focusPulseReady = true;
  updateAllUI();
});

window.addEventListener('beforeunload', function () {
  pauseTimer(false);
  stopAmbient();
  saveState();
});
