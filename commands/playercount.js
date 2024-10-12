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

      const playerCountDescription = config.playercounturl ? 
        `There are currently ${totalPlayers} players online.\n[View Playercount Graph](${config.playercounturl})` : 
        `There are currently ${totalPlayers} players online.`;

      const playerCountEmbed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('Player Count')
        .setDescription(playerCountDescription)
        .setFooter({ text: config.botName, iconURL: config.botLogo })
        .setTimestamp();

      await interaction.reply({ embeds: [playerCountEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error while executing this command!');
    }
  },
};