const client = require("../index");
require('dotenv').config();
const prefix = process.env.PREFIX

client.on('messageCreate', async (message) => {

    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(prefix)
    )
        return;

    const [cmd, ...args] = message.content
        .slice(prefix.length)
        .trim()
        .split(" ");

    const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.alias?.includes(cmd.toLowerCase()));
    
    if (!command) return;

    await command.run(client, message, args);
    console.log(`${message.author.username} ran the command: ${cmd.toLowerCase()}`);


});
