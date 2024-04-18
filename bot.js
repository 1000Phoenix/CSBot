const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.commands = new Map();

const rest = new REST({ version: '9' }).setToken(config.token);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Refresh commands with Discord API
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    const commands = [];
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
      
      // Convert command option types to their API representations
      const commandOptions = command.options ? command.options.map(option => {
        return { ...option, type: commandOptionTypeToNumber(option.type) };
      }) : [];

      // Add the command to the array
      commands.push({
        name: command.name,
        description: command.description,
        options: commandOptions,
      });
    }

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Helper function to convert command option types to their API representations
function commandOptionTypeToNumber(type) {
  const types = {
    'SUB_COMMAND': 1,
    'SUB_COMMAND_GROUP': 2,
    'STRING': 3,
    'INTEGER': 4,
    'BOOLEAN': 5,
    'USER': 6,
    'CHANNEL': 7,
    'ROLE': 8,
    'MENTIONABLE': 9,
    'NUMBER': 10
  };

  return types[type] || 3; // Default to 'STRING' if the type is not recognized
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

require('./scheduler');

client.login(config.token);