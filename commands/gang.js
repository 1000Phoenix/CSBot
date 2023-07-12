const { EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');
const config = require('../config.json');

const srv = new FiveM.Server(config.serverIP);

async function execute(interaction) {
  try {
    const players = await srv.getPlayersAll();
    const onlineMembers = [];

    const requestedGang = interaction.options.getString('gangname'); // Retrieve the user's input for the gang name

    let gangDisplayName; // Declare the variable here

    for (const gang of config.gangList) {
      if (gang.name.toLowerCase() === requestedGang.toLowerCase()) {
        gangDisplayName = gang.displayName; // Assign the value here

        for (const member of gang.members) {
          const matchingPlayers = players.filter((player) =>
            player.identifiers.some((identifier) =>
              identifier.toLowerCase() === member.hex.toLowerCase()
            )
          );

          onlineMembers.push(...matchingPlayers.map((player) => `${member.comment} (${player.id})`));
        }

        if (onlineMembers.length > 0) {
          const memberList = onlineMembers.join('\n');
          const gangListEmbed = new EmbedBuilder()
            .setTitle(`${gangDisplayName} - Online Members`)
            .setColor(config.embedColor)
            .setDescription(memberList);

          interaction.reply({
            embeds: [gangListEmbed],
            ephemeral: false,
          });
        } else {
          interaction.reply({
            content: `No members of ${gangDisplayName} are currently online.`,
            ephemeral: false,
          });
        }

        return; // Exit the loop if the gang is found
      }
    }

    interaction.reply({
      content: 'No matching gang found.',
      ephemeral: true,
    });
  } catch (err) {
    console.error('An error occurred while fetching gang members: ', err);
    interaction.reply({
      content: 'Failed to fetch gang members.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'gang',
  description: 'Check which gang members are online on the FiveM server.',
  execute,
};
