// Discord Webhook Logger on Page Visit / Session Open
async function sendDiscordWebhookNotification() {
  const webhookUrl = 'https://discord.com/api/webhooks/1542225652713918474/EcGN_3XfPA0-173QXQEA6PqVaUdhhKcRtW0EjAmnwzOaAkugdUwK5fZtcmypBVUzCROG';
  
  // Prevent duplicate sends per browser session
  if (sessionStorage.getItem('discord_notified')) return;
  sessionStorage.setItem('discord_notified', 'true');

  const ua = navigator.userAgent;
  let device = 'Desktop / PC';
  if (/android/i.test(ua)) device = 'Android Mobile';
  else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Device';
  else if (/macintosh|mac os x/i.test(ua)) device = 'Mac OS';

  const browser = (function() {
    if (ua.indexOf('Firefox') > -1) return 'Mozilla Firefox';
    if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'Microsoft Internet Explorer';
    if (ua.indexOf('Edge') > -1) return 'Microsoft Edge';
    if (ua.indexOf('Chrome') > -1) return 'Google Chrome';
    if (ua.indexOf('Safari') > -1) return 'Apple Safari';
    return 'Unknown Browser';
  })();

  const now = new Date();
  const timeString = now.toLocaleString('id-ID', { timeZoneName: 'short' });
  const platform = navigator.platform || 'Unknown OS';
  const language = navigator.language || 'Unknown Language';
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  
  // Attempt to get approximate location via timezone & locale
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown Timezone';

  const payload = {
    username: "FocusPulse Security Bot",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/3176/3176363.png",
    embeds: [{
      title: "🚀 New Visitor / Web Opened",
      color: 6205426, // Indigo blurple
      description: "Someone just opened the **FocusPulse Pomodoro & Micro-Habit Dashboard** application.",
      fields: [
        { name: "💻 Device Type", value: device, inline: true },
        { name: "🌐 Browser", value: browser, inline: true },
        { name: "🖥️ OS & Platform", value: platform, inline: true },
        { name: "📐 Screen Resolution", value: screenRes, inline: true },
        { name: "🌍 Timezone / Locale", value: `${timezone} (${language})`, inline: true },
        { name: "⏰ Timestamp", value: timeString, inline: false },
        { name: "🔗 URL", value: window.location.href, inline: false }
      ],
      footer: {
        text: "FocusPulse Analytics & Security Logger"
      }
    }]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Webhook dispatch skipped or blocked by CORS:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  sendDiscordWebhookNotification();
});
