const translations = {
  id: {
    dayStreak:'hari streak', sessions:'sesi', designMode:'Design mode', focusSession:'Focus session',
    enterFocus:'Masuk ke mode fokus', focus:'Fokus', shortBreak:'Istirahat pendek', longBreak:'Istirahat panjang',
    ready:'Siap memulai', start:'Mulai', pause:'Jeda', reset:'Reset', skip:'Lewati',
    currentQuest:'Quest aktif', noneSelected:'Belum ada yang dipilih', questBoard:'Quest board',
    todayTasks:'Tugas hari ini', randomQuest:'Random', taskPlaceholder:'Tambah sesuatu yang ingin diselesaikan...',
    emptyTitle:'Belum ada quest', emptyTasks:'Tambahkan sendiri atau biarkan FocusPulse memilihkan aktivitas random.',
    giveRandom:'Berikan random quest', soundscape:'Soundscape', browse:'Jelajahi', dailyLoop:'Daily loop',
    microHabits:'Micro habits', newHabitPlaceholder:'Tambah kebiasaan kecil...', todayPulse:'Today pulse',
    tasksDone:'task selesai', focusMinutes:'menit fokus', footerText:'Bangun momentum, satu blok fokus dalam satu waktu.',
    customize:'Kustomisasi', personalize:'Personalisasi', designStudio:'Focus Design Studio',
    studioDesc:'Pilih pengalaman yang terasa paling pas untuk cara kamu fokus.', layouts:'Layout',
    ambient:'Ambient', timerPresets:'Timer', chooseLayout:'Pilih bahasa visualmu',
    layoutHint:'Setiap pilihan mengubah layout, tipografi, bentuk panel, warna, dan motion.',
    chooseSound:'Bangun soundscape-mu', soundHint:'Pilihan bertanda bintang direkomendasikan untuk layout aktif.',
    all:'Semua', nature:'Alam', places:'Tempat', noise:'Noise', chooseRhythm:'Pilih ritme fokusmu',
    timerHint:'Mulai cepat, bekerja dalam, atau buat ritmemu sendiri.', custom:'Custom',
    customRhythm:'Ritmemu sendiri', applyCustom:'Terapkan ritme custom', running:'Sedang fokus',
    breakRunning:'Sedang istirahat', paused:'Dijeda', focusComplete:'Sesi fokus selesai!',
    breakComplete:'Istirahat selesai. Siap fokus lagi?', taskAdded:'Random quest ditambahkan!',
    durationsSaved:'Durasi Pomodoro disimpan.', ambientOn:'Ambient dinyalakan', ambientOff:'Ambient dimatikan',
    focusAction:'Fokus', active:'Aktif', delete:'Hapus', themeApplied:'Layout diterapkan',
    recommended:'Recommended', min:'min', play:'Putar', stop:'Berhenti'
  },
  en: {
    dayStreak:'day streak', sessions:'sessions', designMode:'Design mode', focusSession:'Focus session',
    enterFocus:'Enter focus mode', focus:'Focus', shortBreak:'Short break', longBreak:'Long break',
    ready:'Ready to begin', start:'Start', pause:'Pause', reset:'Reset', skip:'Skip',
    currentQuest:'Current quest', noneSelected:'None selected', questBoard:'Quest board',
    todayTasks:"Today's tasks", randomQuest:'Random', taskPlaceholder:'Add something you want to finish...',
    emptyTitle:'No quests yet', emptyTasks:'Add one yourself or let FocusPulse choose a random activity.',
    giveRandom:'Give me a random quest', soundscape:'Soundscape', browse:'Browse', dailyLoop:'Daily loop',
    microHabits:'Micro habits', newHabitPlaceholder:'Add a tiny habit...', todayPulse:'Today pulse',
    tasksDone:'tasks done', focusMinutes:'focus minutes', footerText:'Build momentum, one focused block at a time.',
    customize:'Customize', personalize:'Personalize', designStudio:'Focus Design Studio',
    studioDesc:'Choose the experience that best fits the way you focus.', layouts:'Layouts',
    ambient:'Ambient', timerPresets:'Timer', chooseLayout:'Choose your visual language',
    layoutHint:'Each choice changes the layout, typography, panel shapes, color, and motion.',
    chooseSound:'Build your soundscape', soundHint:'Starred choices are recommended for the active layout.',
    all:'All', nature:'Nature', places:'Places', noise:'Noise', chooseRhythm:'Choose your focus rhythm',
    timerHint:'Start quickly, work deeply, or build your own rhythm.', custom:'Custom',
    customRhythm:'Your own rhythm', applyCustom:'Apply custom rhythm', running:'Focus in progress',
    breakRunning:'Break in progress', paused:'Paused', focusComplete:'Focus session complete!',
    breakComplete:'Break complete. Ready to focus again?', taskAdded:'Random quest added!',
    durationsSaved:'Pomodoro durations saved.', ambientOn:'Ambient sound on', ambientOff:'Ambient sound off',
    focusAction:'Focus', active:'Active', delete:'Delete', themeApplied:'Layout applied',
    recommended:'Recommended', min:'min', play:'Play', stop:'Stop'
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
  document.querySelectorAll('[data-i18n]').forEach(function(element) {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(element) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(element) {
    const value = t(element.dataset.i18nTitle);
    element.title = value;
    element.setAttribute('aria-label', value);
  });
  if (window.focusPulseReady) {
    updateAllUI();
    renderThemePicker();
    renderAmbientPicker();
    renderPresetPicker();
  }
}
window.addEventListener('DOMContentLoaded', function() { setLanguage(currentLang); });
