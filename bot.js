const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const FiveM = require('fivem');

const config = require('./config.json');
const clientId = config.clientId;
const guildId = config.guildId;
const token = config.token;
const serverIP = config.serverIP;
const playersPerPage = 50; // Number of players to display per page
let currentPage = 0; // Current page number

const srv = new FiveM.Server(serverIP);

const commands = [
  {
    name: 'players',
    description: 'Check who is online on the FiveM server.',
  },
  {
    name: 'playerinfo',
    description: 'Get information about a specific player on the FiveM server.',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Specify the player name',
        required: true,
      },
    ],
  },
  {
  name: 'staff',
  description: 'Check which staff members are online on the FiveM server.',
  },
  {
    name: 'gang',
    description: 'Check which gang members are online on the FiveM server.',
    options: [
      {
        name: 'gangname',
        type: 3,
        description: 'Specify the gang name',
        required: true,
      },
    ],
  },
];

const staffHexes = config.staffHexes;
const gangList = config.gangList;

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'players') {
    try {
      const totalPlayers = await srv.getPlayers();
      const players = await srv.getPlayersAll();
      const pageCount = Math.ceil(totalPlayers / playersPerPage);

      if (currentPage < 0) currentPage = 0;
      if (currentPage >= pageCount) currentPage = pageCount - 1;

      const startIndex = currentPage * playersPerPage;
      const endIndex = Math.min(startIndex + playersPerPage, totalPlayers);

      const playerCountMessage = `There are currently ${totalPlayers} player(s) online. Showing players ${startIndex + 1}-${endIndex}.`;

      const playerListEmbed = new EmbedBuilder()
        .setTitle('Player List')
        .setDescription(players.slice(startIndex, endIndex).map(player => `Player ${player.name} with ID ${player.id} is online.`).join('\n'));

      const replyOptions = {
        content: playerCountMessage,
        embeds: [playerListEmbed],
        ephemeral: false,
      };

      if (pageCount > 1) {
        const navigationMessage = `Page ${currentPage + 1} of ${pageCount}. React with ⬅️ to go to the previous page, or ➡️ to go to the next page.`;
        replyOptions.components = [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: 'previous',
                emoji: {
                  name: '⬅️',
                },
              },
              {
                type: 2,
                style: 2,
                custom_id: 'next',
                emoji: {
                  name: '➡️',
                },
              },
            ],
          },
        ];
        interaction.reply(replyOptions);
      } else {
        interaction.reply(replyOptions);
      }
    } catch (err) {
      console.error('An error occurred while fetching players: ', err);
      interaction.reply({
        content: 'Failed to fetch player data.',
        ephemeral: true,
      });
    }
  } else if (commandName === 'playerinfo') {
    try {
        const searchName = options.getString('name');
        const players = await srv.getPlayersAll();

        const matchingPlayers = players.filter((player) => player.name.toLowerCase() === searchName.toLowerCase());

        if (matchingPlayers.length > 0) {
            matchingPlayers.forEach((player) => {
                const identifiersWithEmojis = player.identifiers.map((identifier) => {
                    const identifierPrefix = identifier.split(':')[0];
                    const emojiId = config.emojiIds[identifierPrefix];
                    if (emojiId) {
                        return client.emojis.cache.get(emojiId).toString() + ' ' + identifier;
                    } else {
                        return identifier;
                    }
                });

                const playerInfoEmbed = new EmbedBuilder()
                    .setTitle('Player Information')
                    .addFields(
                        { name: 'Name', value: player.name },
                    )
                    .addFields(
                        { name: 'ID', value: player.id.toString() },
                    )
                    .addFields(
                        { name: 'Identifiers', value: identifiersWithEmojis.join('\n') },
                    )
                    .addFields(
                        { name: 'Ping', value: player.ping.toString() },
                    );

                interaction.reply({
                    embeds: [playerInfoEmbed],
                    ephemeral: false,
                });
            });
        } else {
            const errorMessage = `No player found with the name "${searchName}".`;
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
  } else if (commandName === 'staff') {
    try {
      const players = await srv.getPlayersAll();

      // Filter the player list to include only staff members
      const onlineStaff = players.filter((player) => {
        return player.identifiers.some((identifier) => {
          return staffHexes.some((staffHex) => staffHex.hex.toLowerCase() === identifier.toLowerCase());
        });
      });

      // Check if there are any staff members online
      if (onlineStaff.length > 0) {
        // Prepare a list of online staff members for the message
        const staffList = onlineStaff.map(player => `Staff member ${player.name} with ID ${player.id} is online.`).join('\n');
        const staffListEmbed = new EmbedBuilder()
          .setTitle('Online Staff Members')
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
  } else if (commandName === 'gang') {
  try {
    const players = await srv.getPlayersAll();
    const onlineMembers = [];

    const requestedGang = options.getString('gangname'); // Retrieve the user's input for the gang name

    for (const gang of gangList) {
      if (gang.name.toLowerCase() === requestedGang.toLowerCase()) {
        for (const member of gang.members) {
          const matchingPlayers = players.filter((player) =>
            player.identifiers.some((identifier) =>
              identifier.toLowerCase() === member.hex.toLowerCase()
            )
          );

          onlineMembers.push(...matchingPlayers.map((player) => `${member.comment} (${player.id})`));
        }

        if (onlineMembers.length > 0) {
          const gangDisplayName = gang.displayName;
          const memberList = onlineMembers.join('\n');
          const gangListEmbed = new EmbedBuilder()
            .setTitle(`${gangDisplayName} - Online Members`)
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
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'previous') {
    if (currentPage > 0) {
      currentPage--;
    }
  } else if (interaction.customId === 'next') {
    const totalPlayers = await srv.getPlayers();
    const pageCount = Math.ceil(totalPlayers / playersPerPage);
    if (currentPage < pageCount - 1) {
      currentPage++;
    }
  }

  await interaction.deferUpdate();

  const totalPlayers = await srv.getPlayers();
  const players = await srv.getPlayersAll();
  const pageCount = Math.ceil(totalPlayers / playersPerPage);

  const startIndex = currentPage * playersPerPage;
  const endIndex = Math.min(startIndex + playersPerPage, totalPlayers);

  const playerCountMessage = `There are currently ${totalPlayers} player(s) online. Showing players ${startIndex + 1}-${endIndex}.`;

  const playerListEmbed = new EmbedBuilder()
    .setTitle('Player List')
    .setDescription(players.slice(startIndex, endIndex).map(player => `Player ${player.name} with ID ${player.id} is online.`).join('\n'));

  const replyOptions = {
    content: playerCountMessage,
    embeds: [playerListEmbed],
    ephemeral: false,
  };

  if (pageCount > 1) {
    const navigationMessage = `Page ${currentPage + 1} of ${pageCount}. React with ⬅️ to go to the previous page, or ➡️ to go to the next page.`;
    replyOptions.components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            custom_id: 'previous',
            emoji: {
              name: '⬅️',
            },
          },
          {
            type: 2,
            style: 2,
            custom_id: 'next',
            emoji: {
              name: '➡️',
            },
          },
        ],
      },
    ];
    interaction.editReply(replyOptions);
  } else {
    interaction.editReply(replyOptions);
  }
});

client.login(token);