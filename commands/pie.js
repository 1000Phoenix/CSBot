const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

async function execute(interaction) {
  try {
    // Get the URL or file path of the pie image
    const pieImageUrl = 'https://www.thekitchenmagpie.com/wp-content/uploads/images/2018/06/strawberryrhubarbpie2-500x500.jpg'; // Replace with your actual URL or file path

    // Create an embed message with the pie image
    const pieEmbed = new EmbedBuilder()
      .setTitle('Delicious Pie')
      .setColor(config.embedColor)
      .setImage(pieImageUrl)
      .setFooter({ text: config.botName, iconURL: config.botLogo })
      .setTimestamp();

    // Send the embed message as a reply
    interaction.reply({
      embeds: [pieEmbed],
      ephemeral: false,
    });
  } catch (err) {
    console.error('An error occurred while sending pie image: ', err);
    interaction.reply({
      content: 'Failed to send pie image.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'pie',
  description: 'Cook a delicious pie!',
  execute,
};