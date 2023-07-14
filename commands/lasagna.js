const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

async function execute(interaction) {
  try {
    // Get the URL or file path of the lasagna image
    const lasagnaImageUrl = 'https://th.bing.com/th/id/R.95938be971fb54517704b5b4733330c6?rik=vgBuyPd5wP7l3w&riu=http%3a%2f%2fwww.espressoandcream.com%2fwp-content%2fuploads%2f2013%2f02%2fRolled_Lasagna_1.jpg&ehk=V4kg%2buUpHHhRU7z2%2bquwiJcJ5QsdeK9wBopba3Mo1tg%3d&risl=&pid=ImgRaw&r=0'; // Replace with your actual URL or file path

    // Create an embed message with the lasagna image
    const lasagnaEmbed = new EmbedBuilder()
      .setTitle('Delicious Lasagna')
      .setColor(config.embedColor)
      .setImage(lasagnaImageUrl);

    // Send the embed message as a reply
    interaction.reply({
      embeds: [lasagnaEmbed],
      ephemeral: false,
    });
  } catch (err) {
    console.error('An error occurred while sending lasagna image: ', err);
    interaction.reply({
      content: 'Failed to send lasagna image.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'lasagna',
  description: 'Cook a delicious lasagna!',
  execute,
};