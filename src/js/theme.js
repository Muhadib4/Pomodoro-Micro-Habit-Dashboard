const focusPulseThemes = [
  { id: 'medieval-midnight', name: '⚔️ Medieval Midnight', mode: 'dark' },
  { id: 'royal-parchment', name: '📜 Royal Parchment', mode: 'light' },
  { id: 'enchanted-forest', name: '🌲 Enchanted Forest', mode: 'dark' },
  { id: 'moonlit-castle', name: '🏰 Moonlit Castle', mode: 'dark' },
  { id: 'fairy-bloom', name: '🧚 Fairy Bloom', mode: 'light' },
  { id: 'dragon-ember', name: '🐉 Dragon Ember', mode: 'dark' },
  { id: 'arcane-frost', name: '❄️ Arcane Frost', mode: 'dark' },
  { id: 'sunlit-kingdom', name: '☀️ Sunlit Kingdom', mode: 'light' }
];

function setTheme(themeId) {
  const validTheme = focusPulseThemes.find(function (theme) { return theme.id === themeId; });
  const selected = validTheme ? validTheme.id : 'medieval-midnight';
  document.documentElement.dataset.theme = selected;
  localStorage.setItem('focuspulse_theme_v2', selected);

  const selector = document.getElementById('theme-select');
  if (selector) selector.value = selected;

  const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && color) meta.content = color;
}

window.addEventListener('DOMContentLoaded', function () {
  const selector = document.getElementById('theme-select');
  if (selector) {
    focusPulseThemes.forEach(function (theme) {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name + ' · ' + theme.mode;
      selector.appendChild(option);
    });
  }
  setTheme(localStorage.getItem('focuspulse_theme_v2') || 'medieval-midnight');
});
