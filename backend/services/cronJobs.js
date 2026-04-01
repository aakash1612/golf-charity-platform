const cron = require('node-cron');
const { runDraw } = require('./drawEngine');

// Run on the 1st of every month at 00:01 UTC — auto-publish monthly draw
cron.schedule('1 0 1 * *', async () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  console.log(`[CRON] Running monthly draw for ${month}/${year}`);
  try {
    const draw = await runDraw({ month, year, drawType: 'random', simulate: false });
    console.log(`[CRON] Draw published. Winners: ${draw.winners.length}`);
  } catch (err) {
    console.error('[CRON] Draw failed:', err.message);
  }
}, {
  timezone: 'UTC',
});

console.log('[CRON] Monthly draw scheduler registered');