// Theme Manager (Dark / Light Mode)
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  if (newTheme === 'light') {
    html.removeAttribute('class');
    html.setAttribute('data-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
    html.setAttribute('class', 'dark');
  }
  
  localStorage.setItem('focuspulse_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
    lucide.createIcons();
  }
}

// Load saved theme on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('focuspulse_theme') || 'dark';
  const html = document.documentElement;
  if (savedTheme === 'light') {
    html.removeAttribute('class');
    html.setAttribute('data-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
    html.setAttribute('class', 'dark');
  }
  updateThemeIcon(savedTheme);

  const savedLang = localStorage.getItem('focuspulse_lang') || 'en';
  setLanguage(savedLang);
});
