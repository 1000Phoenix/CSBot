const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'echo',
  description: 'Echoes the message provided by a moderator.',
  options: [
    {
      name: 'message',
      type: 'STRING',
      description: 'The message to echo',
      required: true,
    },
  ],
  async execute(interaction) {
    // Check if the user is a moderator or admin
    if (!config.moderators.includes(interaction.user.id) && !config.admins.includes(interaction.user.id)) {
      return interaction.reply({
        content: 'You do not have permission to use the echo command.',
        ephemeral: true,
      });
    }

    // Get the message to echo from the command options
    const messageToEcho = interaction.options.getString('message');

    // Reply with the message to echo
    await interaction.reply({
      content: messageToEcho,
      ephemeral: false,
    });
  },
};