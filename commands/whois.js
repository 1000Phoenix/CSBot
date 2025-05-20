const { EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');
const config = require('../config.json');

const srv = new FiveM.Server(config.serverIP);

async function execute(interaction) {
  try {
    const playerId = interaction.options.getInteger('id');
    const players = await srv.getPlayersAll();

    const matchingPlayer = players.find((player) => player.id === playerId);

    if (matchingPlayer) {
      // Extract the Steam ID from identifiers
      const identifiers = matchingPlayer.identifiers;
      const steamIdRegex = /steam:([a-zA-Z0-9]+)/i;
      const steamIdMatch = identifiers.find((identifier) => identifier.match(steamIdRegex));
      const steamId = steamIdMatch ? steamIdMatch.match(steamIdRegex)[1] : '';

      // Check if the command issuer is a mod or admin
      const isMod = config.moderators.includes(interaction.user.id);
      const isAdmin = config.admins.includes(interaction.user.id);

      let playerInfoEmbed;

      if (isMod || isAdmin) {
        // Build the embed with full player info
        const identifiersWithEmojis = matchingPlayer.identifiers.map((identifier) => {
          const identifierPrefix = identifier.split(':')[0];
          const emojiId = config.emojiIds[identifierPrefix];
          if (emojiId) {
            return interaction.client.emojis.cache.get(emojiId).toString() + ' ' + identifier;
          } else {
            return identifier;
          }
        });

        playerInfoEmbed = new EmbedBuilder()
          .setTitle('Player Information')
          .setColor(config.embedColor)
          .addFields(
            { name: 'Name', value: matchingPlayer.name || 'Unknown' },
            { name: 'ID', value: matchingPlayer.id?.toString() || 'Unknown' },
            { name: 'Identifiers', value: identifiersWithEmojis.length > 0 ? identifiersWithEmojis.join('\n') : 'No identifiers found' },
            { name: 'Ping', value: matchingPlayer.ping?.toString() || 'Unknown' }
          )
          .setFooter({ text: config.botName, iconURL: config.botLogo })
          .setTimestamp();
      } else {
        // Build the embed with limited player info
        playerInfoEmbed = new EmbedBuilder()
          .setTitle('Player Information')
          .setColor(config.embedColor)
          .addFields(
            { name: 'Name', value: matchingPlayer.name || 'Unknown' },
            { name: 'ID', value: matchingPlayer.id?.toString() || 'Unknown' },
            { name: 'Ping', value: matchingPlayer.ping?.toString() || 'Unknown' }
          )
          .setFooter({ text: config.botName, iconURL: config.botLogo })
          .setTimestamp();
      }

      const replyOptions = {
        embeds: [playerInfoEmbed],
        ephemeral: false,
      };

      if (isMod || isAdmin) {
        // Check if the URL is available in the config
        if (config.profileurl) {
          // Determine the button label
          const buttonLabel = config.profiletext || 'Go to profile';

          // Add the button with the URL including the Steam ID
          const urlWithSteamId = `${config.profileurl}${steamId}`;
          replyOptions.components = [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: buttonLabel,
                  url: urlWithSteamId,
                },
              ],
            },
          ];
        }
      }

      interaction.reply(replyOptions);
    } else {
      const errorMessage = `No player found with the ID "${playerId}".`;
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
  name: 'whois',
  description: 'Get information about a specific player on the FiveM server using their ID.',
  options: [
    {
      name: 'id',
      type: 'INTEGER',
      description: 'The ID of the player',
      required: true,
    },
  ],
  execute,
};