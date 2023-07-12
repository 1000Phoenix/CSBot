const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, GatewayIntentBits, EmbedBuilder, ColorResolvable } = require('discord.js');
const FiveM = require('fivem');

const config = require('./config.json');
const clientId = config.clientId;
const guildId = config.guildId;
const token = config.token;
const serverIP = config.serverIP;
const playersPerPage = 50; // Number of players to display per page
let currentPage = 0; // Current page number

const srv = new FiveM.Server(serverIP);
function getEmbedColor() {
  const colorHex = config.embedColor || '#FFFFFF'; // Use the color value from the config or default to white
  return colorHex instanceof ColorResolvable ? colorHex : parseInt(colorHex.replace('#', ''), 16);
}

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
  {
  name: 'whois',
  description: 'Get information about a specific player on the FiveM server using their ID.',
  options: [
    {
      name: 'id',
      type: 4,
      description: 'Specify the player ID',
      required: true,
    },
  ],
  },
  {
	name: 'lasagna',
	description: 'Cook a delicious lasagna!',
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
} else if (commandName === 'whois') {
  try {
    const playerId = options.getInteger('id');
    const players = await srv.getPlayersAll();

    const matchingPlayer = players.find((player) => player.id === playerId);

    if (matchingPlayer) {
      // Extract the Steam ID from identifiers
      const identifiers = matchingPlayer.identifiers;
      const steamIdRegex = /steam:([a-zA-Z0-9]+)/i;
      const steamIdMatch = identifiers.find((identifier) => identifier.match(steamIdRegex));
      const steamId = steamIdMatch ? steamIdMatch.match(steamIdRegex)[1] : '';

      // Check if the command issuer is a mod or admin
      const isMod = config.moderators.includes(interaction.user.id);
      const isAdmin = config.admins.includes(interaction.user.id);

      let playerInfoEmbed;

      if (isMod || isAdmin) {
        // Build the embed with full player info
        const identifiersWithEmojis = matchingPlayer.identifiers.map((identifier) => {
          const identifierPrefix = identifier.split(':')[0];
          const emojiId = config.emojiIds[identifierPrefix];
          if (emojiId) {
            return client.emojis.cache.get(emojiId).toString() + ' ' + identifier;
          } else {
            return identifier;
          }
        });

        playerInfoEmbed = new EmbedBuilder()
          .setTitle('Player Information')
          .addFields(
            { name: 'Name', value: matchingPlayer.name },
            { name: 'ID', value: matchingPlayer.id.toString() },
            { name: 'Identifiers', value: identifiersWithEmojis.join('\n') },
            { name: 'Ping', value: matchingPlayer.ping.toString() }
          );
      } else {
        // Build the embed with limited player info
        playerInfoEmbed = new EmbedBuilder()
          .setTitle('Player Information')
          .addFields(
            { name: 'Name', value: matchingPlayer.name },
            { name: 'ID', value: matchingPlayer.id.toString() },
            { name: 'Ping', value: matchingPlayer.ping.toString() }
          );
      }

      const replyOptions = {
        embeds: [playerInfoEmbed],
        ephemeral: false,
      };

      if (isMod || isAdmin) {
        // Check if the URL is available in the config
        if (config.profileurl) {
          // Determine the button label
          const buttonLabel = config.profiletext || 'Go to profile';

          // Add the button with the URL including the Steam ID
          const urlWithSteamId = `${config.profileurl}${steamId}`;
          replyOptions.components = [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: buttonLabel,
                  url: urlWithSteamId,
                },
              ],
            },
          ];
        }
      }

      interaction.reply(replyOptions);
    } else {
      const errorMessage = `No player found with the ID "${playerId}".`;
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
} else if (commandName === 'lasagna') {
  try {
    // Get the URL or file path of the lasagna image
    const lasagnaImageUrl = 'https://th.bing.com/th/id/R.95938be971fb54517704b5b4733330c6?rik=vgBuyPd5wP7l3w&riu=http%3a%2f%2fwww.espressoandcream.com%2fwp-content%2fuploads%2f2013%2f02%2fRolled_Lasagna_1.jpg&ehk=V4kg%2buUpHHhRU7z2%2bquwiJcJ5QsdeK9wBopba3Mo1tg%3d&risl=&pid=ImgRaw&r=0'; // Replace with your actual URL or file path

    // Create an embed message with the lasagna image
    const lasagnaEmbed = new EmbedBuilder()
      .setTitle('Delicious Lasagna')
      .setImage(lasagnaImageUrl);

    // Send the embed message as a reply
    interaction.reply({
      embeds: [lasagnaEmbed],
    });
  } catch (err) {
    console.error('An error occurred while sending lasagna image: ', err);
    interaction.reply('Failed to send lasagna image.');
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