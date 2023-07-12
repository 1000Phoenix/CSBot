const { EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');
const config = require('../config.json');

const srv = new FiveM.Server(config.serverIP);

async function execute(interaction) {
  try {
    const players = await srv.getPlayersAll();

    // Filter the player list to include only staff members
    const onlineStaff = players.filter((player) => {
      return player.identifiers.some((identifier) => {
        return config.staffHexes.some((staffHex) => staffHex.hex.toLowerCase() === identifier.toLowerCase());
      });
    });

    // Check if there are any staff members online
    if (onlineStaff.length > 0) {
      // Prepare a list of online staff members for the message
      const staffList = onlineStaff.map(player => `Staff member ${player.name} with ID ${player.id} is online.`).join('\n');
      const staffListEmbed = new EmbedBuilder()
        .setTitle('Online Staff Members')
        .setColor(config.embedColor)
        .setDescription(staffList);

      interaction.reply({
        embeds: [staffListEmbed],
        ephemeral: false,
      });
    } else {
      interaction.reply({
        content: 'No staff members are currently online.',
        ephemeral: false,
      });
    }
  } catch (err) {
    console.error('An error occurred while fetching staff members: ', err);
    interaction.reply({
      content: 'Failed to fetch staff member data.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'staff',
  description: 'Check which staff members are online on the FiveM server.',
  execute,
};