// FocusPulse Main App Logic (Modular & Interactive with Speech & Sound)

let state = {
  lang: 'en',
  theme: 'dark', // dark, light
  timer: {
    mode: 'pomodoro',
    duration: 25 * 60,
    timeLeft: 25 * 60,
    isRunning: false,
    timerId: null,
    completedPomodoros: 0,
    totalFocusMinutes: 125
  },
  tasks: [
    { id: 1, text: 'Design modular frontend & Discord webhook integration', completed: true, active: false, tag: 'Dev' },
    { id: 2, text: 'Implement bilingual (ID/EN) & Light/Dark mode', completed: false, active: true, tag: 'UI' },
    { id: 3, text: 'Test interactive speech synthesizer & ambient rain sound', completed: false, active: false, tag: 'Audio' }
  ],
  habits: [
    { id: 1, name: 'Drink 500ml Water / Minum Air', icon: 'droplet', completedToday: true, streak: 14, category: 'Health' },
    { id: 2, name: '2-Min Desk Stretch / Peregangan', icon: 'activity', completedToday: false, streak: 6, category: 'Wellness' },
    { id: 3, name: 'Read 10 Pages / Membaca Buku', icon: 'book-open', completedToday: true, streak: 9, category: 'Growth' },
    { id: 4, name: 'Review Daily Goals / Evaluasi', icon: 'zap', completedToday: false, streak: 5, category: 'Productivity' }
  ],
  ambientPlaying: false,
  soundTheme: 'rain',
  pomodoroDurations: {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  }
};

let audioCtx = null;
let ambientNode = null;
let ambientGainNode = null;

window.addEventListener('DOMContentLoaded', () => {
  loadLocalStorage();
  lucide.createIcons();
  applyLanguage();
  applyTheme();
  renderTasks();
  renderHabits();
  renderHeatmap();
  updateTimerDisplay();
});

// ==================== LOCAL STORAGE ====================
function saveLocalStorage() {
  try {
    localStorage.setItem('fp_modular_state', JSON.stringify({
      lang: state.lang,
      theme: state.theme,
      tasks: state.tasks,
      habits: state.habits,
      completedPomodoros: state.timer.completedPomodoros,
      totalFocusMinutes: state.timer.totalFocusMinutes
    }));
  } catch(e) {}
}

function loadLocalStorage() {
  try {
    const saved = localStorage.getItem('fp_modular_state');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.lang) state.lang = p.lang;
      if (p.theme) state.theme = p.theme;
      if (p.tasks) state.tasks = p.tasks;
      if (p.habits) state.habits = p.habits;
      if (p.completedPomodoros !== undefined) state.timer.completedPomodoros = p.completedPomodoros;
      if (p.totalFocusMinutes !== undefined) state.timer.totalFocusMinutes = p.totalFocusMinutes;
    }
  } catch(e) {}
}

// ==================== I18N & THEME ====================
function setLanguage(lang) {
  state.lang = lang;
  applyLanguage();
  saveLocalStorage();
  speakText(lang === 'id' ? 'Bahasa Indonesia diaktifkan' : 'English language enabled');
}

function applyLanguage() {
  const t = translations[state.lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });
  
  const taskInput = document.getElementById('new-task-input');
  if (taskInput) taskInput.placeholder = t.addTaskPlaceholder;
  
  const habitInput = document.getElementById('habit-name-input');
  if (habitInput) habitInput.placeholder = t.habitPlaceholder;
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveLocalStorage();
}

function applyTheme() {
  const body = document.body;
  const icon = document.getElementById('theme-icon');
  if (state.theme === 'light') {
    body.classList.add('light-mode');
    if (icon) icon.setAttribute('data-lucide', 'sun');
  } else {
    body.classList.remove('light-mode');
    if (icon) icon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

// ==================== VOICE / SPEECH SYNTHESIS ====================
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.lang === 'id' ? 'id-ID' : 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// ==================== TIMER ENGINE ====================
function setTimerMode(mode) {
  state.timer.mode = mode;
  state.timer.duration = state.pomodoroDurations[mode];
  state.timer.timeLeft = state.timer.duration;
  pauseTimer();
  
  ['pomodoro', 'shortBreak', 'longBreak'].forEach(m => {
    const btn = document.getElementById(`tab-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = 'px-4 py-1.5 rounded-lg text-xs font-medium transition-all bg-[#5e6ad2] text-white shadow-sm';
      } else {
        btn.className = 'px-4 py-1.5 rounded-lg text-xs font-medium transition-all text-[#8a8f98] hover:text-[#f7f8f8]';
      }
    }
  });
  updateTimerDisplay();
  speakText(`Mode ${translations[state.lang][mode]}`);
}

function toggleTimer() {
  if (state.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  state.timer.isRunning = true;
  const t = translations[state.lang];
  document.getElementById('timer-toggle-label').innerText = t.pause;
  document.getElementById('timer-toggle-icon').setAttribute('data-lucide', 'pause');
  document.getElementById('timer-status-text').innerText = state.timer.mode === 'pomodoro' ? t.focusActive : t.breakActive;
  lucide.createIcons();

  state.timer.timerId = setInterval(() => {
    if (state.timer.timeLeft > 0) {
      state.timer.timeLeft--;
      if (state.timer.mode === 'pomodoro') {
        state.timer.totalFocusMinutes += 1/60;
      }
      updateTimerDisplay();
    } else {
      clearInterval(state.timer.timerId);
      state.timer.isRunning = false;
      playCompletionDing();
      
      if (state.timer.mode === 'pomodoro') {
        state.timer.completedPomodoros++;
        saveLocalStorage();
      }
      
      const msg = state.lang === 'id' ? 'Sesi waktu selesai! Waktunya beristirahat.' : 'Session completed! Time for a break.';
      speakText(msg);
      alert(msg);
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  clearInterval(state.timer.timerId);
  const t = translations[state.lang];
  const labelEl = document.getElementById('timer-toggle-label');
  const iconEl = document.getElementById('timer-toggle-icon');
  const statusEl = document.getElementById('timer-status-text');
  
  if (labelEl) labelEl.innerText = t.startFocus;
  if (iconEl) iconEl.setAttribute('data-lucide', 'play');
  if (statusEl) statusEl.innerText = t.timerPaused;
  lucide.createIcons();
}

function resetTimer() {
  pauseTimer();
  state.timer.timeLeft = state.timer.duration;
  updateTimerDisplay();
  const t = translations[state.lang];
  const statusEl = document.getElementById('timer-status-text');
  if (statusEl) statusEl.innerText = t.readyToFocus;
}

function skipTimer() {
  pauseTimer();
  if (state.timer.mode === 'pomodoro') setTimerMode('shortBreak');
  else setTimerMode('pomodoro');
}

function updateTimerDisplay() {
  const minutes = Math.floor(state.timer.timeLeft / 60);
  const seconds = state.timer.timeLeft % 60;
  const displayStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const displayEl = document.getElementById('timer-display');
  if (displayEl) displayEl.innerText = displayStr;
  document.title = `${displayStr} &mdash; FocusPulse`;

  const ring = document.getElementById('timer-progress-ring');
  if (ring) {
    const circumference = 729;
    const progress = state.timer.timeLeft / state.timer.duration;
    const offset = circumference - (progress * circumference);
    ring.style.strokeDashoffset = offset;
  }
}

// ==================== AUDIO SYNTH & AMBIENT ====================
function playCompletionDing() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
  } catch (e) {}
}

function toggleAmbientSound() {
  state.ambientPlaying = !state.ambientPlaying;
  const btn = document.getElementById('ambient-btn');
  const label = document.getElementById('ambient-label');
  const t = translations[state.lang];
  
  if (state.ambientPlaying) {
    if (label) label.innerText = `${t.ambientRain.split(':')[0]}: Rain`;
    if (btn) btn.classList.add('border-[#7170ff]', 'bg-[#5e6ad2]/10');
    startAmbientGenerator('rain');
    speakText(state.lang === 'id' ? 'Suara latar hujan diaktifkan' : 'Ambient rain started');
  } else {
    if (label) label.innerText = t.ambientOff;
    if (btn) btn.classList.remove('border-[#7170ff]', 'bg-[#5e6ad2]/10');
    stopAmbientGenerator();
  }
}

function startAmbientGenerator(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 0.12;
    }
    
    ambientNode = audioCtx.createBufferSource();
    ambientNode.buffer = noiseBuffer;
    ambientNode.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    
    ambientGainNode = audioCtx.createGain();
    ambientGainNode.gain.value = 0.5;
    
    ambientNode.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(audioCtx.destination);
    ambientNode.start();
  } catch(e) {}
}

function stopAmbientGenerator() {
  if (ambientNode) {
    try { ambientNode.stop(); } catch(e) {}
    ambientNode = null;
  }
}

// ==================== TASK MANAGER ====================
function renderTasks() {
  const list = document.getElementById('task-list');
  if (!list) return;
  list.innerHTML = '';
  
  let completedCount = 0;
  state.tasks.forEach(task => {
    if (task.completed) completedCount++;
    const div = document.createElement('div');
    div.className = `flex items-center justify-between p-3 rounded-xl border transition-all ${task.active ? 'bg-[rgba(94,106,210,0.06)] border-[#5e6ad2]/40 shadow-sm' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'}`;
    div.innerHTML = `
      <div class="flex items-center space-x-3 flex-1">
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})" class="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent text-[#5e6ad2] focus:ring-0 cursor-pointer">
        <div>
          <span class="text-xs ${task.completed ? 'line-through text-[#8a8f98]' : 'text-[#f7f8f8]'} block">${task.text}</span>
          <span class="text-[10px] text-[#7170ff] bg-[#5e6ad2]/10 px-1.5 py-0.5 rounded font-mono">${task.tag || 'General'}</span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="setActiveTask(${task.id})" class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${task.active ? 'bg-[#5e6ad2] text-white' : 'text-[#8a8f98] hover:text-[#f7f8f8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'}">
          ${task.active ? 'Active' : 'Focus'}
        </button>
        <button onclick="deleteTask(${task.id})" class="text-[#8a8f98] hover:text-red-400 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    list.appendChild(div);
  });

  const progressText = document.getElementById('task-progress-text');
  if (progressText) progressText.innerText = `${completedCount}/${state.tasks.length}`;
  
  const activeTask = state.tasks.find(t => t.active);
  const activeTaskName = document.getElementById('active-task-name');
  if (activeTaskName) activeTaskName.innerText = activeTask ? activeTask.text : translations[state.lang].noneSelected;
  
  lucide.createIcons();
  saveLocalStorage();
}

function addTask(e) {
  e.preventDefault();
  const input = document.getElementById('new-task-input');
  const tagSelect = document.getElementById('new-task-tag');
  const text = input.value.trim();
  if (!text) return;
  
  state.tasks.push({
    id: Date.now(),
    text,
    completed: false,
    active: state.tasks.length === 0,
    tag: tagSelect ? tagSelect.value : 'General'
  });
  input.value = '';
  renderTasks();
  speakText("Tugas ditambahkan");
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
}

function setActiveTask(id) {
  state.tasks.forEach(t => t.active = (t.id === id));
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  renderTasks();
}

// ==================== HABITS ====================
function renderHabits() {
  const list = document.getElementById('habits-list');
  if (!list) return;
  list.innerHTML = '';
  const t = translations[state.lang];

  state.habits.forEach(habit => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all';
    div.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="p-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[#7170ff]">
          <i data-lucide="${habit.icon}" class="w-4 h-4"></i>
        </div>
        <div>
          <span class="text-xs font-medium text-[#f7f8f8] block">${habit.name}</span>
          <div class="flex items-center space-x-2 mt-0.5">
            <span class="text-[10px] text-[#8a8f98] font-mono">Streak: ${habit.streak} 🔥</span>
            <span class="text-[10px] text-[#5e6ad2] bg-[#5e6ad2]/10 px-1.5 py-0.2 rounded">${habit.category}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="toggleHabit(${habit.id})" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${habit.completedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[rgba(255,255,255,0.03)] text-[#8a8f98] hover:text-[#f7f8f8] border border-[rgba(255,255,255,0.08)]'}">
          <i data-lucide="${habit.completedToday ? 'check' : 'plus'}" class="w-3.5 h-3.5"></i>
          <span>${habit.completedToday ? t.completed : t.doHabit}</span>
        </button>
        <button onclick="deleteHabit(${habit.id})" class="text-[#8a8f98] hover:text-red-400 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
  saveLocalStorage();
}

function toggleHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (habit) {
    habit.completedToday = !habit.completedToday;
    habit.streak += habit.completedToday ? 1 : -1;
    renderHabits();
    renderHeatmap();
    speakText("Kebiasaan diperbarui");
  }
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  renderHabits();
}

function openAddHabitModal() {
  document.getElementById('habit-modal').classList.remove('hidden');
}

function closeAddHabitModal() {
  document.getElementById('habit-modal').classList.add('hidden');
}

function handleCreateHabit(e) {
  e.preventDefault();
  const name = document.getElementById('habit-name-input').value.trim();
  const icon = document.getElementById('habit-icon-select').value;
  const category = document.getElementById('habit-category-select').value || 'Habit';
  if (!name) return;

  state.habits.push({ id: Date.now(), name, icon, completedToday: false, streak: 1, category });
  document.getElementById('habit-name-input').value = '';
  closeAddHabitModal();
  renderHabits();
}

// ==================== HEATMAP ====================
function renderHeatmap() {
  const grid = document.getElementById('heatmap-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  for (let i = 0; i < 28; i++) {
    const cell = document.createElement('div');
    const intensity = Math.random();
    let bgClass = 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]';
    if (intensity > 0.75) bgClass = 'bg-[#5e6ad2]';
    else if (intensity > 0.45) bgClass = 'bg-[#5e6ad2]/75';
    else if (intensity > 0.2) bgClass = 'bg-[#5e6ad2]/35';

    cell.className = `w-full h-7 rounded-md transition-all hover:scale-105 cursor-pointer ${bgClass}`;
    grid.appendChild(cell);
  }
}

// ==================== ANALYTICS & SETTINGS MODALS ====================
function openStatsModal() {
  document.getElementById('analytics-modal').classList.remove('hidden');
  document.getElementById('stat-total-pomodoros').innerText = state.timer.completedPomodoros + 14;
  document.getElementById('stat-focus-hours').innerText = (state.timer.totalFocusMinutes / 60).toFixed(1) + 'h';
}

function closeStatsModal() {
  document.getElementById('analytics-modal').classList.add('hidden');
}

function openTimerSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeTimerSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveTimerSettings(e) {
  e.preventDefault();
  const p = parseInt(document.getElementById('setting-pomodoro-time').value) || 25;
  const s = parseInt(document.getElementById('setting-short-time').value) || 5;
  const l = parseInt(document.getElementById('setting-long-time').value) || 15;

  state.pomodoroDurations.pomodoro = p * 60;
  state.pomodoroDurations.shortBreak = s * 60;
  state.pomodoroDurations.longBreak = l * 60;

  setTimerMode(state.timer.mode);
  closeTimerSettings();
}
