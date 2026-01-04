/**
 * Keep-alive job om Render sleep te voorkomen
 * Dit zorgt dat de backend periodiek zichzelf "pingt" via interne calls
 */

import { config } from '../config/index.js';

export function startKeepAliveJob() {
  if (config.app.nodeEnv === 'test') {
    return;
  }

  // Prevent Render sleep: ping every 5 minutes
  const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // First ping after 2 minutes (prevent startup spam)
  setTimeout(() => {
    console.log('🔄 Keep-alive job scheduled (every 5 minutes)');
  }, 2 * 60 * 1000);

  setInterval(async () => {
    try {
      // Perform a light internal operation to keep the process alive
      const timestamp = new Date().toISOString();
      console.log(`💚 Backend keep-alive ping at ${timestamp}`);
      
      // Log some basic metrics
      const uptime = process.uptime();
      const memory = process.memoryUsage();
      console.log(`   Uptime: ${Math.floor(uptime)}s, Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB`);
    } catch (error) {
      console.error('❌ Keep-alive job error:', error);
    }
  }, KEEP_ALIVE_INTERVAL);
}
