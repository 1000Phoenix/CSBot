const { EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');
const config = require('../config.json');

const srv = new FiveM.Server(config.serverIP);

async function execute(interaction) {
  try {
    const searchName = interaction.options.getString('name');
    const players = await srv.getPlayersAll();

    const matchingPlayers = players.filter((player) => player.name.toLowerCase() === searchName.toLowerCase());

    if (matchingPlayers.length > 0) {
      matchingPlayers.forEach((player) => {
        const identifiersWithEmojis = player.identifiers.map((identifier) => {
          const identifierPrefix = identifier.split(':')[0];
          const emojiId = config.emojiIds[identifierPrefix];
          if (emojiId) {
            return interaction.client.emojis.cache.get(emojiId).toString() + ' ' + identifier;
          } else {
            return identifier;
          }
        });

        const playerInfoEmbed = new EmbedBuilder()
          .setTitle('Player Information')
          .setColor(config.embedColor)
          .addFields(
            { name: 'Name', value: player.name || 'Unknown' },
            { name: 'ID', value: player.id?.toString() || 'Unknown' },
            { name: 'Identifiers', value: identifiersWithEmojis.length > 0 ? identifiersWithEmojis.join('\n') : 'No identifiers found' },
            { name: 'Ping', value: player.ping?.toString() || 'Unknown' }
          )
          .setFooter({ text: config.botName, iconURL: config.botLogo })
          .setTimestamp();

        interaction.reply({
          embeds: [playerInfoEmbed],
          ephemeral: false,
        });
      });
    } else {
      const errorMessage = `No player found with the name "${searchName}".`;
      interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  } catch (err) {
    console.error('An error occurred while fetching player info: ', err);
    interaction.reply({
      content: 'Failed to fetch player info.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'playerinfo',
  description: 'Get information about a specific player on the FiveM server.',
  options: [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the player',
      required: true,
    },
  ],
  execute,
};