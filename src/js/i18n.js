// FocusPulse i18n Translations (EN / ID)

const translations = {
  en: {
    streak: "Day 14 Streak 🔥",
    ambient: "Ambient:",
    analytics: "Analytics",
    pomodoro: "Pomodoro",
    shortBreak: "Short Break",
    longBreak: "Long Break",
    readyToFocus: "Ready to Focus",
    focusActive: "Focus Session Active",
    breakActive: "Break in Progress",
    paused: "Timer Paused",
    startFocus: "Start Focus",
    pause: "Pause",
    completedToday: "Completed today:",
    focusTasks: "Focus Tasks & Queue",
    addTaskPlaceholder: "Add a new task for this session...",
    addTaskBtn: "Add Task",
    completed: "completed",
    active: "Active",
    focus: "Focus",
    microHabits: "Micro-Habits Tracker",
    microHabitsDesc: "Tiny 2-minute daily habits that compound into massive results over time.",
    newHabit: "New Habit",
    doHabit: "Do",
    doneHabit: "Completed",
    consistencyMatrix: "Consistency Matrix",
    consistencyDesc: "Your daily micro-habit and focus completion overview (past 4 weeks).",
    less: "Less",
    more: "More",
    focusInsight: "Focus Insight & AI Coach",
    defaultInsight: "You are most productive during morning Pomodoro sessions. Keep up the momentum!",
    footer: "FocusPulse &mdash; Pomodoro & Micro-Habit Dashboard &bull; Designed with Linear Systems"
  },
  id: {
    streak: "Streak 14 Hari 🔥",
    ambient: "Ambient:",
    analytics: "Analitik",
    pomodoro: "Pomodoro",
    shortBreak: "Istirahat Pendek",
    longBreak: "Istirahat Panjang",
    readyToFocus: "Siap untuk Fokus",
    focusActive: "Sesi Fokus Aktif",
    breakActive: "Waktu Istirahat",
    paused: "Timer Dijeda",
    startFocus: "Mulai Fokus",
    pause: "Jeda",
    completedToday: "Selesai hari ini:",
    focusTasks: "Daftar Tugas & Fokus",
    addTaskPlaceholder: "Tambahkan tugas baru untuk sesi ini...",
    addTaskBtn: "Tambah Tugas",
    completed: "selesai",
    active: "Aktif",
    focus: "Fokus",
    microHabits: "Pelacak Kebiasaan Mikro",
    microHabitsDesc: "Kebiasaan kecil 2 menit sehari yang menghasilkan pencapaian besar.",
    newHabit: "Kebiasaan Baru",
    doHabit: "Lakukan",
    doneHabit: "Selesai",
    consistencyMatrix: "Matriks Konsistensi",
    consistencyDesc: "Ikhtisar penyelesaian kebiasaan harian dan fokus (4 minggu terakhir).",
    less: "Sedikit",
    more: "Banyak",
    focusInsight: "Wawasan Fokus & Pelatih AI",
    defaultInsight: "Anda paling produktif selama sesi Pomodoro pagi. Pertahankan momentum!",
    footer: "FocusPulse &mdash; Dasbor Pomodoro & Kebiasaan Mikro &bull; Didesain dengan Linear Systems"
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('focuspulse_lang', lang);
  
  // Update button active state
  document.getElementById('lang-en-btn').className = lang === 'en' ? 'px-2 py-1 rounded-lg text-xs font-semibold bg-[#5e6ad2] text-white' : 'px-2 py-1 rounded-lg text-xs text-[#8a8f98] hover:text-[#f7f8f8]';
  document.getElementById('lang-id-btn').className = lang === 'id' ? 'px-2 py-1 rounded-lg text-xs font-semibold bg-[#5e6ad2] text-white' : 'px-2 py-1 rounded-lg text-xs text-[#8a8f98] hover:text-[#f7f8f8]';

  applyTranslations();
}

function t(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.innerHTML = translations[currentLang][key];
    }
  });

  const taskInput = document.getElementById('new-task-input');
  if (taskInput) taskInput.placeholder = t('addTaskPlaceholder');
}
