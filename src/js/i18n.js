const translations = {
  id: {
    dayStreak: 'hari streak', language: 'Bahasa', focusRitual: 'Ritual fokus', focus: 'Fokus',
    shortBreak: 'Istirahat Pendek', longBreak: 'Istirahat Panjang', ready: 'Siap memulai',
    start: 'Mulai', pause: 'Jeda', reset: 'Reset', skip: 'Lewati', currentQuest: 'Quest aktif:',
    noneSelected: 'Belum ada yang dipilih', pomodoroOptions: 'Opsi Pomodoro', preset: 'Preset',
    applyDuration: 'Terapkan durasi', soundscape: 'Soundscape', ambientWorld: 'Dunia ambient',
    chooseAmbient: 'Pilih ambient', volume: 'Volume', dailyProgress: 'Progres harian',
    microHabits: 'Micro habits', newHabitPlaceholder: 'Tambah kebiasaan kecil...',
    questBoard: 'Papan quest', todayTasks: 'Tugas hari ini', surpriseMe: 'Kasih random',
    taskPlaceholder: 'Apa yang ingin kamu selesaikan?', addQuest: 'Tambah quest',
    emptyTasks: 'Papan quest masih kosong.', tryRandom: 'Coba tugas random',
    footerText: 'Aksi kecil, konsistensi legendaris.', sessions: 'sesi', running: 'Sedang fokus',
    breakRunning: 'Sedang istirahat', paused: 'Dijeda', focusComplete: 'Sesi fokus selesai!',
    breakComplete: 'Istirahat selesai. Siap fokus lagi?', taskAdded: 'Quest random ditambahkan!',
    durationsSaved: 'Durasi Pomodoro disimpan.', ambientOn: 'Ambient dinyalakan',
    ambientOff: 'Ambient dimatikan', focusAction: 'Fokus', active: 'Aktif', delete: 'Hapus'
  },
  en: {
    dayStreak: 'day streak', language: 'Language', focusRitual: 'Focus ritual', focus: 'Focus',
    shortBreak: 'Short Break', longBreak: 'Long Break', ready: 'Ready to begin',
    start: 'Start', pause: 'Pause', reset: 'Reset', skip: 'Skip', currentQuest: 'Current quest:',
    noneSelected: 'None selected', pomodoroOptions: 'Pomodoro options', preset: 'Preset',
    applyDuration: 'Apply durations', soundscape: 'Soundscape', ambientWorld: 'Ambient world',
    chooseAmbient: 'Choose ambient', volume: 'Volume', dailyProgress: 'Daily progress',
    microHabits: 'Micro habits', newHabitPlaceholder: 'Add a tiny habit...',
    questBoard: 'Quest board', todayTasks: "Today's tasks", surpriseMe: 'Surprise me',
    taskPlaceholder: 'What do you want to finish?', addQuest: 'Add quest',
    emptyTasks: 'Your quest board is empty.', tryRandom: 'Try a random task',
    footerText: 'Small actions, legendary consistency.', sessions: 'sessions', running: 'Focus in progress',
    breakRunning: 'Break in progress', paused: 'Paused', focusComplete: 'Focus session complete!',
    breakComplete: 'Break complete. Ready to focus again?', taskAdded: 'Random quest added!',
    durationsSaved: 'Pomodoro durations saved.', ambientOn: 'Ambient sound on',
    ambientOff: 'Ambient sound off', focusAction: 'Focus', active: 'Active', delete: 'Delete'
  }
};

let currentLang = localStorage.getItem('focuspulse_language') || 'id';

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.id[key] || key;
}

function setLanguage(lang) {
  currentLang = translations[lang] ? lang : 'id';
  localStorage.setItem('focuspulse_language', currentLang);
  document.documentElement.lang = currentLang;

  const selector = document.getElementById('language-select');
  if (selector) selector.value = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(function (element) {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (element) {
    const value = t(element.dataset.i18nTitle);
    element.title = value;
    element.setAttribute('aria-label', value);
  });

  if (window.focusPulseReady) {
    updateAllUI();
  }
}

window.addEventListener('DOMContentLoaded', function () {
  setLanguage(currentLang);
});
