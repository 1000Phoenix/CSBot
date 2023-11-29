const FiveM = require('fivem');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const serverIP = config.serverIP;
const playersPerPage = 50; // Number of players to display per page

const srv = new FiveM.Server(serverIP);

// Current page number for each guild
const currentPage = {};

module.exports = {
  name: 'players',
  description: 'Check who is online on the FiveM server.',
  async execute(interaction, isButtonInteraction = false) {
    if (!currentPage[interaction.guild.id]) currentPage[interaction.guild.id] = 0;

    try {
      const totalPlayers = await srv.getPlayers();
      const players = await srv.getPlayersAll();
      const pageCount = Math.ceil(totalPlayers / playersPerPage);

      if (currentPage[interaction.guild.id] < 0) currentPage[interaction.guild.id] = 0;
      if (currentPage[interaction.guild.id] >= pageCount) currentPage[interaction.guild.id] = pageCount - 1;

      const startIndex = currentPage[interaction.guild.id] * playersPerPage;
      const endIndex = Math.min(startIndex + playersPerPage, totalPlayers);

      const playerCountMessage = `There are currently ${totalPlayers} player(s) online. Showing players ${startIndex + 1}-${endIndex}.`;

      const playerListEmbed = new EmbedBuilder()
        .setTitle('Player List')
        .setColor(config.embedColor)
        .setDescription(players.slice(startIndex, endIndex).map(player => `Player ${player.name} with ID ${player.id} is online.`).join('\n'));

      const replyOptions = {
        content: playerCountMessage,
        embeds: [playerListEmbed],
        ephemeral: false,
      };

      if (pageCount > 1) {
        const navigationMessage = `Page ${currentPage[interaction.guild.id] + 1} of ${pageCount}. React with ⬅️ to go to the previous page, or ➡️ to go to the next page.`;
        replyOptions.components = [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: 'previous',
                emoji: {
                  name: '⬅️',
                },
              },
              {
                type: 2,
                style: 2,
                custom_id: 'next',
                emoji: {
                  name: '➡️',
                },
              },
            ],
          },
        ];
        if(isButtonInteraction) {
          await interaction.update(replyOptions);
        } else {
          await interaction.reply(replyOptions);
        }
      } else {
        if(isButtonInteraction) {
          await interaction.update(replyOptions);
        } else {
          await interaction.reply(replyOptions);
        }
      }
    } catch (err) {
      console.error('An error occurred while fetching players: ', err);
      await interaction.reply({
        content: 'Failed to fetch player data.',
        ephemeral: true,
      });
    }
  },
  async handleButton(interaction) {
    if (interaction.customId === 'previous') {
      if (currentPage[interaction.guild.id] > 0) {
        currentPage[interaction.guild.id]--;
      }
      await this.execute(interaction, true);
    } else if (interaction.customId === 'next') {
      const totalPlayers = await srv.getPlayers();
      const pageCount = Math.ceil(totalPlayers / playersPerPage);
      if (currentPage[interaction.guild.id] < pageCount - 1) {
        currentPage[interaction.guild.id]++;
      }
      await this.execute(interaction, true);
    }
  }
};