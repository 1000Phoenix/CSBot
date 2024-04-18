const cron = require('node-cron');
const { logIdentifiersToDatabase } = require('./logidentifiers');
const { logPlayerCount } = require('./logplayercount');

// Schedule tasks to run every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled task: logIdentifiersToDatabase');
  logIdentifiersToDatabase();
});

cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled task: logPlayerCount');
  logPlayerCount();
});