const FiveM = require('fivem');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const serverIP = config.serverIP;
const playersPerPage = 50; // Number of players to display per page
let currentPage = 0; // Current page number

const srv = new FiveM.Server(serverIP);

module.exports = {
  name: 'players',
  description: 'Check who is online on the FiveM server.',
  async execute(interaction) {
    try {
      const totalPlayers = await srv.getPlayers();
      const players = await srv.getPlayersAll();
      const pageCount = Math.ceil(totalPlayers / playersPerPage);

      if (currentPage < 0) currentPage = 0;
      if (currentPage >= pageCount) currentPage = pageCount - 1;

      const startIndex = currentPage * playersPerPage;
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
        const navigationMessage = `Page ${currentPage + 1} of ${pageCount}. React with ⬅️ to go to the previous page, or ➡️ to go to the next page.`;
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
        interaction.reply(replyOptions);
      } else {
        interaction.reply(replyOptions);
      }
    } catch (err) {
      console.error('An error occurred while fetching players: ', err);
      interaction.reply({
        content: 'Failed to fetch player data.',
        ephemeral: true,
      });
    }
  },
  async handleButton(interaction) {
    if (interaction.customId === 'previous') {
      if (currentPage > 0) {
        currentPage--;
      }
      // Now re-run the execute command to display the updated page.
      await this.execute(interaction);
    } else if (interaction.customId === 'next') {
      const totalPlayers = await srv.getPlayers();
      const pageCount = Math.ceil(totalPlayers / playersPerPage);
      if (currentPage < pageCount - 1) {
        currentPage++;
      }
      // Now re-run the execute command to display the updated page.
      await this.execute(interaction);
    }
  }
};