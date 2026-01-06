/**
 * Keep-alive pinger voor Render
 * Voorkomt dat de backend in sleep mode gaat
 * IMPORTANT: Render gratis tier slaapt na 15 minuten inactiviteit
 * Dit script pingt elke 5 minuten om dit te voorkomen
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes (moet onder de 15 minuten zijn)

async function pingBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    if (response.ok) {
      console.log(`✅ Backend pinged successfully at ${new Date().toISOString()}`);
    }
  } catch (error) {
    console.log(`⚠️ Backend ping failed at ${new Date().toISOString()} (backend may be starting)`);
  }
}

// Start pinging - alleen als we niet in development mode zijn
if (typeof window !== 'undefined') {
  // Ping direct wanneer app laadt
  pingBackend();
  
  // Dan elke 5 minuten
  setInterval(pingBackend, PING_INTERVAL);
  console.log('🔄 Backend keep-alive pinger started (every 5 minutes) - prevents Render sleep');
}
