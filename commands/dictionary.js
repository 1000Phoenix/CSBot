const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'dictionary',
    description: 'Fetches the definition of a word.',
    options: [
        {
            name: 'word',
            type: 'STRING',
            description: 'The word to define',
            required: true,
        },
    ],
    async execute(interaction) {
        const word = interaction.options.getString('word');
        const fetch = (await import('node-fetch')).default;

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await response.json();

            if (!data.length) {
                await interaction.reply({
                    content: `No definitions found for the word "${word}".`,
                    ephemeral: true,
                });
                return;
            }

            const definitions = data[0].meanings.map(meaning => 
                `${meaning.partOfSpeech}: ${meaning.definitions.map(def => def.definition).join('\n')}`
            ).join('\n\n');

            const definitionEmbed = new EmbedBuilder()
                .setTitle(`Definitions of ${word}`)
                .setDescription(definitions)
                .setColor(config.embedColor)
                .setFooter({ text: config.botName, iconURL: config.botLogo })
                .setTimestamp();

            await interaction.reply({ embeds: [definitionEmbed] });
        } catch (error) {
            console.error('Failed to fetch definition: ', error);
            await interaction.reply({
                content: 'Failed to fetch the definition. Please try again later.',
                ephemeral: true,
            });
        }
    }
};