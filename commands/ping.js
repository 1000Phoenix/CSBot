const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Checks the bot\'s ping to the Discord server.',
  execute(interaction) {
    const ping = interaction.client.ws.ping;

    const pingEmbed = new EmbedBuilder()
      .setTitle('Bot Ping')
      .setDescription(`Current ping: ${ping}ms`)
      .setColor(config.embedColor)
      .setFooter({ text: config.botName, iconURL: config.botLogo })
      .setTimestamp();

    interaction.reply({ embeds: [pingEmbed] });
  },
};