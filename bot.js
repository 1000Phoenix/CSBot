const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'An error occurred while executing the command.',
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    const command = client.commands.get(interaction.message.interaction.commandName);

    if (command && typeof command.handleButton === 'function') {
      await command.handleButton(interaction);
    }
  }
});

client.login(config.token);