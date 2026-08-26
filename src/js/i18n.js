const translations = {
  en: {
    streak: "Day 14 Streak 🔥",
    analytics: "Analytics",
    pomodoro: "Pomodoro",
    shortBreak: "Short Break",
    longBreak: "Long Break",
    startFocus: "Start Focus",
    pause: "Pause",
    ready: "Ready to Focus",
    activeSession: "Focus Session Active",
    breakProgress: "Break in Progress",
    paused: "Timer Paused",
    currentTask: "Current Focus Task:",
    noneSelected: "None selected",
    completedToday: "Completed today:",
    focusTasks: "Focus Tasks & Queue",
    addTaskPlaceholder: "Add a new task for this session...",
    addTaskBtn: "Add Task",
    completed: "completed",
    microHabits: "Micro-Habits Tracker",
    newHabit: "New Habit",
    habitsDesc: "Tiny 2-minute daily habits that compound into massive results over time.",
    doHabit: "Do",
    doneHabit: "Completed",
    consistencyMatrix: "Consistency Matrix",
    matrixDesc: "Your daily micro-habit and focus completion overview (past 4 weeks).",
    less: "Less",
    more: "More",
    focusInsight: "Focus Insight & AI Coach",
    defaultInsight: "You are most productive during morning Pomodoro sessions. Keep up the momentum!",
    footer: "FocusPulse &mdash; Pomodoro & Micro-Habit Dashboard &bull; Advanced Edition",
    ambient: "Ambient:"
  },
  id: {
    streak: "Streak 14 Hari 🔥",
    analytics: "Analitik",
    pomodoro: "Pomodoro",
    shortBreak: "Istirahat Singkat",
    longBreak: "Istirahat Panjang",
    startFocus: "Mulai Fokus",
    pause: "Jeda",
    ready: "Siap Fokus",
    activeSession: "Sesi Fokus Aktif",
    breakProgress: "Waktu Istirahat",
    paused: "Timer Dijeda",
    currentTask: "Task Fokus Saat Ini:",
    noneSelected: "Belum dipilih",
    completedToday: "Selesai hari ini:",
    focusTasks: "Daftar & Antrean Tugas",
    addTaskPlaceholder: "Tambah tugas baru untuk sesi ini...",
    addTaskBtn: "Tambah Tugas",
    completed: "selesai",
    microHabits: "Pelacak Kebiasaan Mikro",
    newHabit: "Habit Baru",
    habitsDesc: "Kebiasaan kecil 2 menit sehari yang menghasilkan perubahan besar.",
    doHabit: "Lakukan",
    doneHabit: "Selesai",
    consistencyMatrix: "Matriks Konsistensi",
    matrixDesc: "Ringkasan harian penyelesaian kebiasaan & fokus (4 minggu terakhir).",
    less: "Sedikit",
    more: "Banyak",
    focusInsight: "Wawasan Fokus & Pelatih AI",
    defaultInsight: "Anda paling produktif di sesi pagi. Pertahankan momentum!",
    footer: "FocusPulse &mdash; Pomodoro & Micro-Habit Dashboard &bull; Edisi Lanjutan",
    ambient: "Ambient:"
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('focuspulse_lang', lang);
  
  // Update active state on language buttons
  const btnEn = document.getElementById('lang-en');
  const btnId = document.getElementById('lang-id');
  if (btnEn && btnId) {
    if (lang === 'en') {
      btnEn.className = 'px-2 py-1 rounded text-xs font-medium bg-[#5e6ad2] text-white';
      btnId.className = 'px-2 py-1 rounded text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8]';
    } else {
      btnId.className = 'px-2 py-1 rounded text-xs font-medium bg-[#5e6ad2] text-white';
      btnEn.className = 'px-2 py-1 rounded text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8]';
    }
  }
  
  // Translate static DOM elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
}
