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
        .setDescription(`There are currently ${totalPlayers} players online.`)

      await interaction.reply({ embeds: [playerCountEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error while executing this command!');
    }
  },
};