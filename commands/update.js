const { exec } = require('child_process');
const config = require('../config.json');

module.exports = {
  name: 'update',
  description: 'Pulls the latest changes from GitHub and restarts the bot.',
  async execute(interaction) {
    // Check if the user is authorized to update the bot
    if (!config.admins.includes(interaction.user.id)) {
      return interaction.reply({
        content: 'You do not have permission to update the bot.',
        ephemeral: true,
      });
    }

    // Inform the user that the bot is attempting to update
    await interaction.reply({
      content: 'Attempting to update the bot...',
      ephemeral: false,
    });

    // Pull the latest changes from GitHub and restart the bot using PM2
    exec('git pull && pm2 reload all', async (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        await interaction.followUp({
          content: 'Failed to update the bot.',
          ephemeral: true,
        });
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      // The bot will restart so we can't send a message here
    });
  },
};