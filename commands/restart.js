const { exec } = require('child_process');
const config = require('../config.json');

module.exports = {
  name: 'restart',
  description: 'Restarts the bot.',
  async execute(interaction) {
    // Check if the user is authorized to restart the bot
    if (interaction.user.id !== config.admins) {
      return interaction.reply({
        content: 'You do not have permission to restart the bot.',
        ephemeral: true,
      });
    }

    try {
      await interaction.reply({
        content: 'Restarting the bot...',
        ephemeral: true,
      });

      // Use PM2 to restart the bot
      exec('pm2 restart discord-bot', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          interaction.followUp({
            content: 'Failed to restart the bot.',
            ephemeral: true,
          });
          return;
        }
        console.log(`stdout: ${stdout}`);
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
      });
    } catch (error) {
      console.error('An error occurred while attempting to restart the bot: ', error);
      interaction.followUp({
        content: 'Failed to restart the bot.',
        ephemeral: true,
      });
    }
  },
};