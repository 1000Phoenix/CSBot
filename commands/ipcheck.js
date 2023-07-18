const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const https = require('https');

async function execute(interaction) {
  try {
    const serverCode = interaction.options.getString('server_code'); // Get the specified server code from the command options

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(`https://servers-frontend.fivem.net/api/servers/single/${serverCode}`, options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          const serverData = JSON.parse(data);
          const connectEndPoints = serverData.Data && serverData.Data.connectEndPoints;
          const serverName = serverData.Data && serverData.Data.vars && serverData.Data.vars.sv_projectName;

          if (Array.isArray(connectEndPoints) && connectEndPoints.length > 0) {
            const [ipPort] = connectEndPoints;
            const [ipAddress, port] = ipPort.split(':');

            const ipEmbed = new EmbedBuilder()
              .setTitle(`Server IP - ${serverCode}`)
              .setColor(config.embedColor)
              .setDescription(`**${serverName}**\nIP: ${ipAddress}:${port}`);

            interaction.reply({
              embeds: [ipEmbed],
              ephemeral: false,
            });
          } else {
            interaction.reply({
              content: 'No valid connectEndPoints found.',
              ephemeral: true,
            });
          }
        } else {
          throw new Error('Network response was not ok');
        }
      });
    });

    req.on('error', (error) => {
      console.error('An error occurred while fetching server information: ', error);
      interaction.reply({
        content: 'Failed to fetch server information.',
        ephemeral: true,
      });
    });

    req.end();
  } catch (error) {
    console.error('An error occurred while fetching server information: ', error);
    interaction.reply({
      content: 'Failed to fetch server information.',
      ephemeral: true,
    });
  }
}

module.exports = {
  name: 'ipcheck',
  description: 'Get the IP address of a server by its code.',
  options: [
    {
      name: 'server_code',
      description: 'The code of the server to search for.',
      type: 'STRING',
      required: true,
    },
  ],
  execute,
};