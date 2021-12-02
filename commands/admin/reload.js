const fs = require('fs');
require('module-alias/register')

//This is for holding all the command folders that hold several commands within them
const commandFolders = fs.readdirSync('./commands');

module.exports = {
    name: "reload",
    alias: ["r"],
    description: 'Reload a command',
    run: async (client, message, args) => { 

    console.log(message.author.id)

    //If the user is not the client owner reject the reload
    if(message.author.id != 338544317427875851 && message.author.id != 268833425614438411 && message.author.id != 731590888706408510)
    {
        return message.channel.send({content: "You aren't sticky enough for that."})
    }

    //Make sure a command is given to reload
    if(!args[0])
    {
        return message.channel.send({content: "What command should I reload?"})
    }

    //Make command lower case before looking for it
    let commandName = args[0].toLowerCase()
    commandName = commandName.concat(".js"); //add js to command reciece for comparison later 


    //loop to run through all the folders
    for(const folder of commandFolders)
    {
    //Find each file when going through the folder
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

        //loop through each file in the folders
        for (const file of commandFiles) 
        {
            //require the folder and file to run the command
            const command = require(`@root/commands/${folder}/${file}`);

            //if the command in chat matches the file name run it
            if(commandName == file)
            {
                delete require.cache[require.resolve(`@root/commands/${folder}/${file}`)]

                client.commands.delete(commandName)

                const pull = require(`@root/commands/${folder}/${file}`)

                client.commands.set(commandName, pull)

                //If successful let user know
                return message.channel.send({content: `The command \`${args[0].toUpperCase()}\` has been reloaded!`})
            }
        }

    }

    return message.channel.send({content: `Unable to reload: \`${args[0].toUpperCase()}\``})


    }
}