const DESIGN_THEMES = [
  {
    id:'bento-grid', name:'Bento Grid', badge:'Balanced', icon:'layout-dashboard',
    description:'Modular cards with dense information and clear visual rhythm.', bestFor:'Daily dashboard · balanced focus',
    edition:'BENTO', defaultAmbient:'rain', recommended:['rain','library','cafe','pink'],
    previewClass:'preview-bento', preview:{bg:'#0b0e14',panel:'#202631',border:'1px solid rgba(255,255,255,.08)',panelBorder:'0',radius:'6px',shadow:'none'}
  },
  {
    id:'minimalism', name:'Minimalism', badge:'Calm', icon:'minus',
    description:'One quiet column, generous whitespace, and almost zero visual noise.', bestFor:'Reading · calm study sessions',
    edition:'MINIMAL', defaultAmbient:'library', recommended:['library','fan','brown','river'],
    previewClass:'preview-minimal', preview:{bg:'#f3f3ef',panel:'#181818',border:'1px solid #d5d5cf',panelBorder:'0',radius:'1px',shadow:'none'}
  },
  {
    id:'maximalism', name:'Maximalism', badge:'Expressive', icon:'sparkles',
    description:'Bold gradients, playful scale, loud contrast, and energetic composition.', bestFor:'Creative work · high energy',
    edition:'MAXIMAL', defaultAmbient:'cafe', recommended:['cafe','tavern','thunder','train'],
    previewClass:'preview-maximal', preview:{bg:'#311350',panel:'linear-gradient(135deg,#ffcf32,#ff4fa3)',border:'1px solid rgba(255,255,255,.3)',panelBorder:'0',radius:'8px',shadow:'0 5px 0 #140821'}
  },
  {
    id:'brutalism', name:'Brutalism', badge:'Raw', icon:'box',
    description:'Hard borders, oversized type, sharp blocks, and unapologetic structure.', bestFor:'Coding sprints · zero nonsense',
    edition:'BRUTAL', defaultAmbient:'clockwork', recommended:['clockwork','white','train','thunder'],
    previewClass:'preview-brutal', preview:{bg:'#ffed00',panel:'#fff',border:'3px solid #080808',panelBorder:'2px solid #080808',radius:'0',shadow:'4px 4px 0 #080808'}
  },
  {
    id:'liquid-glass', name:'Liquid Glass', badge:'Immersive', icon:'droplets',
    description:'Floating translucent surfaces, soft depth, and luminous fluid color.', bestFor:'Deep work · immersive ambience',
    edition:'LIQUID', defaultAmbient:'ocean', recommended:['ocean','space','rain','river'],
    previewClass:'preview-liquid', preview:{bg:'linear-gradient(135deg,#124b6b,#442d75)',panel:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.22)',panelBorder:'1px solid rgba(255,255,255,.22)',radius:'9px',shadow:'inset 0 1px rgba(255,255,255,.25)'}
  }
];

let currentThemeId = localStorage.getItem('focuspulse_design_theme') || 'bento-grid';

function getCurrentTheme() {
  return DESIGN_THEMES.find(function(theme) { return theme.id === currentThemeId; }) || DESIGN_THEMES[0];
}
function setTheme(themeId, userInitiated) {
  const theme = DESIGN_THEMES.find(function(item) { return item.id === themeId; }) || DESIGN_THEMES[0];
  currentThemeId = theme.id;
  localStorage.setItem('focuspulse_design_theme', currentThemeId);
  document.documentElement.dataset.theme = currentThemeId;
  const label = document.getElementById('current-theme-label');
  const edition = document.getElementById('brand-edition');
  if (label) label.textContent = theme.name;
  if (edition) edition.textContent = theme.edition;
  const meta = document.querySelector('meta[name="theme-color"]');
  requestAnimationFrame(function() {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (meta && bg) meta.content = bg;
  });
  renderThemePicker();
  if (userInitiated && typeof applyThemeAmbient === 'function') {
    applyThemeAmbient(theme);
    if (typeof showToast === 'function') showToast(theme.name + ' — ' + t('themeApplied'));
  }
}
function renderThemePicker() {
  const grid = document.getElementById('theme-card-grid');
  if (!grid) return;
  grid.innerHTML = '';
  DESIGN_THEMES.forEach(function(theme) {
    const button = document.createElement('button');
    const p = theme.preview;
    button.type = 'button';
    button.className = 'theme-card' + (theme.id === currentThemeId ? ' selected' : '');
    button.onclick = function() { setTheme(theme.id, true); };
    button.innerHTML =
      '<div class="theme-preview ' + theme.previewClass + '" style="--preview-bg:' + p.bg + ';--preview-panel:' + p.panel + ';--preview-border:' + p.border + ';--preview-panel-border:' + p.panelBorder + ';--preview-radius:' + p.radius + ';--preview-shadow:' + p.shadow + '"><span></span><span></span><span></span><span></span></div>' +
      '<div class="theme-card-copy"><strong>' + theme.name + '</strong><small>' + theme.description + '</small><div class="theme-card-meta"><span>' + theme.badge + '</span><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4L19 6"/></svg></i></div></div>';
    grid.appendChild(button);
  });
  renderThemeSpotlight();
}
function renderThemeSpotlight() {
  const spotlight = document.getElementById('theme-spotlight');
  if (!spotlight) return;
  const theme = getCurrentTheme();
  const p = theme.preview;
  spotlight.innerHTML =
    '<div class="spotlight-preview theme-preview ' + theme.previewClass + '" style="--preview-bg:' + p.bg + ';--preview-panel:' + p.panel + ';--preview-border:' + p.border + ';--preview-panel-border:' + p.panelBorder + ';--preview-radius:' + p.radius + ';--preview-shadow:' + p.shadow + '"><span></span><span></span><span></span><span></span></div>' +
    '<div class="spotlight-copy"><span class="spotlight-kicker">CURRENT EXPERIENCE</span><h4>' + theme.name + '</h4><p>' + theme.description + '</p><div><span>' + theme.bestFor + '</span><strong>✓ Active</strong></div></div>';
}
function openDesignStudio(tab) {
  const modal = document.getElementById('studio-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  switchStudioTab(tab || 'themes');
  renderThemePicker();
  if (typeof renderAmbientPicker === 'function') renderAmbientPicker();
  if (typeof renderPresetPicker === 'function') renderPresetPicker();
  window.setTimeout(function() {
    const close = modal.querySelector('.studio-close');
    if (close) close.focus();
  }, 80);
}
function closeDesignStudio() {
  const modal = document.getElementById('studio-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function switchStudioTab(tab) {
  ['themes','ambient','timer'].forEach(function(name) {
    const button = document.getElementById('studio-tab-' + name);
    const panel = document.getElementById('studio-panel-' + name);
    if (button) button.classList.toggle('active', name === tab);
    if (panel) panel.hidden = name !== tab;
  });
}
window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeDesignStudio();
});
window.addEventListener('DOMContentLoaded', function() {
  setTheme(currentThemeId, false);
  renderThemePicker();
});
