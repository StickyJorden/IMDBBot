require('module-alias/register')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

// Place your client and guild ids here
const clientId = '654595068170076161';
const guildId = '451945274487865344';
const commands = [];

module.exports = (bot) => {

    bot.handleCommands = async (commandFolders, path) => {
        
        for (const folder of commandFolders) {

            //Find each file when going through the folder
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

            //loop through each file in the folders
            for (const file of commandFiles) {

                //require the folder and file to run the command
                const command = require(`@root/commands/${folder}/${file}`);
                bot.handleCommands.set(file.name, file)
                commands.push(command.data.toJSON());
            }

        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error.message);
            }
        })();
    }



}