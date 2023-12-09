const FiveM = require('fivem');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const serverIP = config.serverIP;

const srv = new FiveM.Server(serverIP);

module.exports = {
  name: 'playercount',
  description: 'Check the number of players online on the FiveM server.',
  async execute(interaction) {
    try {
      const totalPlayers = await srv.getPlayers();

      const playerCountEmbed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('Player Count')
        .setDescription(`There are currently ${totalPlayers} players online.\n[View 7-day Playercount Graph](https://thousandphoenix.grafana.net/public-dashboards/c50b0952bff946709b10c65155e7a723)`)
        .setFooter({ text: config.botName, iconURL: config.botLogo })
        .setTimestamp();

      await interaction.reply({ embeds: [playerCountEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error while executing this command!');
    }
  },
};