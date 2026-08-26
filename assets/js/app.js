// FocusPulse & Micro-Habit Dashboard &mdash; App Logic

// App State
let state = {
  timer: {
    mode: 'pomodoro', // pomodoro, shortBreak, longBreak, custom
    duration: 25 * 60,
    timeLeft: 25 * 60,
    isRunning: false,
    timerId: null,
    completedPomodoros: 0,
    totalFocusMinutes: 125
  },
  tasks: [
    { id: 1, text: 'Design frontend architecture & Linear UI components', completed: true, active: false, tag: 'Design' },
    { id: 2, text: 'Implement Pomodoro countdown & audio synthesizer', completed: false, active: true, tag: 'Dev' },
    { id: 3, text: 'Build Micro-Habits tracker with streak persistence', completed: false, active: false, tag: 'Habit' },
    { id: 4, text: 'Add ambient rain noise generator & analytics modals', completed: false, active: false, tag: 'Audio' }
  ],
  habits: [
    { id: 1, name: 'Drink 500ml Water', icon: 'droplet', completedToday: true, streak: 14, category: 'Health' },
    { id: 2, name: '2-Min Desk Stretch', icon: 'activity', completedToday: false, streak: 6, category: 'Wellness' },
    { id: 3, name: 'Read 10 Pages of Book', icon: 'book-open', completedToday: true, streak: 9, category: 'Growth' },
    { id: 4, name: 'Review Daily Priorities', icon: 'zap', completedToday: false, streak: 5, category: 'Productivity' },
    { id: 5, name: 'Quick Mindfulness / Breathe', icon: 'wind', completedToday: true, streak: 12, category: 'Mental' }
  ],
  quotes: [
    "You are most productive during morning Pomodoro sessions. Keep up the momentum!",
    "Micro-habits compound: 1% better every day results in 37x gains in a year.",
    "Deep work is the superpower of the 21st century. Eliminate distractions.",
    "Protect your attention like your life depends on it — because your success does."
  ],
  ambientPlaying: false,
  soundTheme: 'rain', // rain, forest, coffee
  pomodoroDurations: {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  }
};

let audioCtx = null;
let ambientNode = null;
let ambientGainNode = null;

// Initialize Lucide icons & load persisted state on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  lucide.createIcons();
  renderTasks();
  renderHabits();
  renderHeatmap();
  updateTimerDisplay();
  rotateAiInsight();
  
  // Rotate AI insight every 30 seconds
  setInterval(rotateAiInsight, 30000);
});

function saveToLocalStorage() {
  try {
    localStorage.setItem('focuspulse_state', JSON.stringify({
      tasks: state.tasks,
      habits: state.habits,
      completedPomodoros: state.timer.completedPomodoros,
      totalFocusMinutes: state.timer.totalFocusMinutes
    }));
  } catch(e) {
    console.warn('LocalStorage unavailable', e);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('focuspulse_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tasks) state.tasks = parsed.tasks;
      if (parsed.habits) state.habits = parsed.habits;
      if (parsed.completedPomodoros !== undefined) state.timer.completedPomodoros = parsed.completedPomodoros;
      if (parsed.totalFocusMinutes !== undefined) state.timer.totalFocusMinutes = parsed.totalFocusMinutes;
    }
  } catch(e) {
    console.warn('Failed to load LocalStorage', e);
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
  document.getElementById('timer-toggle-label').innerText = 'Pause';
  document.getElementById('timer-toggle-icon').setAttribute('data-lucide', 'pause');
  document.getElementById('timer-status-text').innerText = state.timer.mode === 'pomodoro' ? 'Focus Session Active' : 'Break in Progress';
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
        saveToLocalStorage();
        updateStatsDisplay();
      }
      
      alert(`Session completed! Time for a ${state.timer.mode === 'pomodoro' ? 'break' : 'focus session'}.`);
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  clearInterval(state.timer.timerId);
  const labelEl = document.getElementById('timer-toggle-label');
  const iconEl = document.getElementById('timer-toggle-icon');
  const statusEl = document.getElementById('timer-status-text');
  
  if (labelEl) labelEl.innerText = 'Start Focus';
  if (iconEl) iconEl.setAttribute('data-lucide', 'play');
  if (statusEl) statusEl.innerText = 'Timer Paused';
  lucide.createIcons();
}

function resetTimer() {
  pauseTimer();
  state.timer.timeLeft = state.timer.duration;
  updateTimerDisplay();
  const statusEl = document.getElementById('timer-status-text');
  if (statusEl) statusEl.innerText = 'Ready to Focus';
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

// ==================== AUDIO SYNTH ====================
function playCompletionDing() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
  } catch (e) {
    console.log('Audio blocked', e);
  }
}

function toggleAmbientSound() {
  state.ambientPlaying = !state.ambientPlaying;
  const btn = document.getElementById('ambient-btn');
  const label = document.getElementById('ambient-label');
  
  if (state.ambientPlaying) {
    if (label) label.innerText = `Ambient: ${capitalize(state.soundTheme)}`;
    if (btn) btn.classList.add('border-[#7170ff]', 'bg-[#5e6ad2]/10');
    startAmbientGenerator(state.soundTheme);
  } else {
    if (label) label.innerText = 'Ambient: Off';
    if (btn) btn.classList.remove('border-[#7170ff]', 'bg-[#5e6ad2]/10');
    stopAmbientGenerator();
  }
}

function setAmbientSoundType(type) {
  state.soundTheme = type;
  if (state.ambientPlaying) {
    stopAmbientGenerator();
    startAmbientGenerator(type);
    const label = document.getElementById('ambient-label');
    if (label) label.innerText = `Ambient: ${capitalize(type)}`;
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
      if (type === 'rain') {
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 0.12;
      } else if (type === 'forest') {
        output[i] = (lastOut + (0.05 * white)) / 1.05;
        lastOut = output[i];
        output[i] *= 0.08;
      } else { // coffee shop / pink noise
        output[i] = (lastOut + (0.03 * white)) / 1.03;
        lastOut = output[i];
        output[i] *= 0.10;
      }
    }
    
    ambientNode = audioCtx.createBufferSource();
    ambientNode.buffer = noiseBuffer;
    ambientNode.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'rain' ? 700 : 1200;
    
    ambientGainNode = audioCtx.createGain();
    ambientGainNode.gain.value = 0.5;
    
    ambientNode.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(audioCtx.destination);
    ambientNode.start();
  } catch(e) {
    console.error('Ambient audio error', e);
  }
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
  if (progressText) progressText.innerText = `${completedCount}/${state.tasks.length} completed`;
  
  const activeTask = state.tasks.find(t => t.active);
  const activeTaskName = document.getElementById('active-task-name');
  if (activeTaskName) activeTaskName.innerText = activeTask ? activeTask.text : 'None selected';
  
  lucide.createIcons();
  saveToLocalStorage();
}

function addTask(e) {
  e.preventDefault();
  const input = document.getElementById('new-task-input');
  const tagSelect = document.getElementById('new-task-tag');
  const text = input.value.trim();
  if (!text) return;
  
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    active: state.tasks.length === 0,
    tag: tagSelect ? tagSelect.value : 'General'
  };
  state.tasks.push(newTask);
  input.value = '';
  renderTasks();
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

// ==================== MICRO-HABITS TRACKER ====================
function renderHabits() {
  const list = document.getElementById('habits-list');
  if (!list) return;
  list.innerHTML = '';

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
            <span class="text-[10px] text-[#8a8f98] font-mono">Streak: ${habit.streak} days 🔥</span>
            <span class="text-[10px] text-[#5e6ad2] bg-[#5e6ad2]/10 px-1.5 py-0.2 rounded">${habit.category}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="toggleHabit(${habit.id})" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${habit.completedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[rgba(255,255,255,0.03)] text-[#8a8f98] hover:text-[#f7f8f8] border border-[rgba(255,255,255,0.08)]'}">
          <i data-lucide="${habit.completedToday ? 'check' : 'plus'}" class="w-3.5 h-3.5"></i>
          <span>${habit.completedToday ? 'Completed' : 'Do'}</span>
        </button>
        <button onclick="deleteHabit(${habit.id})" class="text-[#8a8f98] hover:text-red-400 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
  saveToLocalStorage();
}

function toggleHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (habit) {
    habit.completedToday = !habit.completedToday;
    habit.streak += habit.completedToday ? 1 : -1;
    renderHabits();
    renderHeatmap();
  }
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  renderHabits();
}

function openAddHabitModal() {
  const modal = document.getElementById('habit-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddHabitModal() {
  const modal = document.getElementById('habit-modal');
  if (modal) modal.classList.add('hidden');
}

function handleCreateHabit(e) {
  e.preventDefault();
  const name = document.getElementById('habit-name-input').value.trim();
  const icon = document.getElementById('habit-icon-select').value;
  const category = document.getElementById('habit-category-select').value || 'Habit';
  if (!name) return;

  state.habits.push({
    id: Date.now(),
    name,
    icon,
    completedToday: false,
    streak: 1,
    category
  });
  document.getElementById('habit-name-input').value = '';
  closeAddHabitModal();
  renderHabits();
}

// ==================== HEATMAP MATRIX ====================
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
    cell.title = `Day ${28 - i}: Active focus & habit streak`;
    grid.appendChild(cell);
  }
}

// ==================== ANALYTICS & AI INSIGHTS ====================
function openStatsModal() {
  const modal = document.getElementById('analytics-modal');
  if (modal) {
    modal.classList.remove('hidden');
    updateStatsDisplay();
  }
}

function closeStatsModal() {
  const modal = document.getElementById('analytics-modal');
  if (modal) modal.classList.add('hidden');
}

function updateStatsDisplay() {
  const totalPomodorosEl = document.getElementById('stat-total-pomodoros');
  const focusHoursEl = document.getElementById('stat-focus-hours');
  const habitRateEl = document.getElementById('stat-habit-rate');
  
  const completed = state.timer.completedPomodoros + 12;
  if (totalPomodorosEl) totalPomodorosEl.innerText = completed;
  if (focusHoursEl) focusHoursEl.innerText = (state.timer.totalFocusMinutes / 60).toFixed(1) + 'h';
  
  const completedHabits = state.habits.filter(h => h.completedToday).length;
  const habitRate = state.habits.length > 0 ? Math.round((completedHabits / state.habits.length) * 100) : 85;
  if (habitRateEl) habitRateEl.innerText = `${habitRate}%`;
}

function rotateAiInsight() {
  const insightEl = document.getElementById('ai-insight-text');
  if (insightEl) {
    const randomQuote = state.quotes[Math.floor(Math.random() * state.quotes.length)];
    insightEl.innerText = `"${randomQuote}"`;
  }
}

// ==================== SETTINGS MODAL ====================
function openTimerSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeTimerSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.classList.add('hidden');
}

function saveTimerSettings(e) {
  e.preventDefault();
  const pomodoroMin = parseInt(document.getElementById('setting-pomodoro-time').value) || 25;
  const shortBreakMin = parseInt(document.getElementById('setting-short-time').value) || 5;
  const longBreakMin = parseInt(document.getElementById('setting-long-time').value) || 15;

  state.pomodoroDurations.pomodoro = pomodoroMin * 60;
  state.pomodoroDurations.shortBreak = shortBreakMin * 60;
  state.pomodoroDurations.longBreak = longBreakMin * 60;

  setTimerMode(state.timer.mode);
  closeTimerSettings();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
