const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'uptime',
  description: 'Displays how long the bot has been running.',
  execute(interaction) {
    const totalSeconds = (interaction.client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds % 60);

    const uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

    const uptimeEmbed = new EmbedBuilder()
      .setTitle('Bot Uptime')
      .setDescription(`The bot has been running for: ${uptime}`)
      .setColor(config.embedColor)
      .setFooter({ text: config.botName, iconURL: config.botLogo })
      .setTimestamp();

    interaction.reply({ embeds: [uptimeEmbed] });
  },
};