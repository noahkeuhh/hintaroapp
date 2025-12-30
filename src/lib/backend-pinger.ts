/**
 * Keep-alive pinger voor Render
 * Voorkomt dat de backend in sleep mode gaat
 */

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function pingBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });
    if (response.ok) {
      console.log('✅ Backend pinged successfully');
    }
  } catch (error) {
    console.log('⚠️ Backend ping failed (normal if backend is sleeping)');
  }
}

// Start pinging
setInterval(pingBackend, PING_INTERVAL);
console.log('🔄 Backend keep-alive pinger started (every 10 minutes)');
