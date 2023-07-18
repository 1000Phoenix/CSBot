const { EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');
const config = require('../config.json');

const srv = new FiveM.Server(config.serverIP);

async function execute(interaction) {
  try {
    const players = await srv.getPlayersAll();

    const staffLists = {};

    config.staffLevels.forEach((level) => {
      // Filter the player list to include only staff members of this level
      const onlineStaff = players.filter((player) => {
        return player.identifiers.some((identifier) => {
          return config.staffMembers.some((staffMember) => {
            return staffMember.hex.toLowerCase() === identifier.toLowerCase() && staffMember.level === level;
          });
        });
      });

      if (onlineStaff.length > 0) {
        // Prepare a list of online staff members for the message
        staffLists[level] = onlineStaff.map(player => `Staff member ${player.name} with ID ${player.id} is online.`).join('\n');
      }
    });

    // Check if there are any staff members online
    if (Object.keys(staffLists).length > 0) {
      const staffListEmbed = new EmbedBuilder()
        .setTitle('Online Staff Members')
        .setColor(config.embedColor);

      // Add a field for each staff level
      for (const [levelName, staffList] of Object.entries(staffLists)) {
        staffListEmbed.addFields({ name: levelName, value: staffList });
      }

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