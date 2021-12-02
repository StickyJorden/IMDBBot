
module.exports = {
  name: "ping",
  alias: [],
  description: 'Return with pong in chat',
  run: async (client, message, args) => { 
    message.channel.send({content: "Pong!"})
  }
}
