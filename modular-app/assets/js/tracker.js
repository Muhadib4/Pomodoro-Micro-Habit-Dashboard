// Discord Webhook Tracking & Initialization
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1542225652713918474/EcGN_3XfPA0-173QXQEA6PqVaUdhhKcRtW0EjAmnwzOaAkugdUwK5fZtcmypBVUzCROG";

async function sendVisitorNotification() {
  // Check session storage so it sends once per browser session
  if (sessionStorage.getItem('fp_visited')) return;
  
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident")) browser = "MS Internet Explorer";
  else if (ua.includes("Edge")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Apple Safari";

  let os = "Unknown OS";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("like Mac")) os = "iOS";

  const timeNow = new Date().toLocaleString('id-ID', { timeZoneName: 'short' });
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || navigator.userLanguage;

  // Attempt to fetch IP / geolocation info if possible, fallback gracefully
  let locationInfo = "Lokasi: Mendeteksi...";
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data && data.city) {
      locationInfo = `${data.city}, ${data.region}, ${data.country_name} (IP: ${data.ip})`;
    }
  } catch (e) {
    locationInfo = "Lokasi: Tidak dapat diakses (CORS/Network)";
  }

  const payload = {
    content: "🚀 **Pengunjung Baru Membuka Dashboard FocusPulse!**",
    embeds: [
      {
        title: "📊 Detail Kunjungan & Perangkat",
        color: 6205522, // Indigo blurple
        fields: [
          { name: "🕒 Waktu Akses", value: timeNow, inline: true },
          { name: "💻 Sistem Operasi", value: os, inline: true },
          { name: "🌐 Perambah (Browser)", value: browser, inline: true },
          { name: "📐 Resolusi Layar", value: screenRes, inline: true },
          { name: "🗣️ Bahasa Browser", value: language, inline: true },
          { name: "📍 Lokasi / IP", value: locationInfo, inline: false },
          { name: "🔗 URL Referrer", value: document.referrer || "Direct Access", inline: false }
        ],
        footer: { text: "FocusPulse Security & Analytics Tracker" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    sessionStorage.setItem('fp_visited', 'true');
  } catch (err) {
    console.warn("Gagal mengirim webhook ke Discord:", err);
  }
}

// Trigger visitor notification on load
window.addEventListener('DOMContentLoaded', () => {
  sendVisitorNotification();
});
