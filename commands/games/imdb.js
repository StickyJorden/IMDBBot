
const Discord = require("discord.js");
const { MessageActionRow, MessageButton } = require('discord.js');

// Import the discordjs-button-pagination package
const paginationEmbed = require('discordjs-button-pagination');

const { Graph } = require("../../bacon/graph.js"); 
const marvel = require("./imdb.js");
const { Node } = require("../../bacon/node.js"); 
const fs = require('fs');
const { exit } = require('process');


//We can call the JSON file for marvel database
const data = JSON.parse(fs.readFileSync('../../movie.json','utf8'));

//We can call the JSON file for marvel database
const path = JSON.parse(fs.readFileSync('../../start_end_points.json','utf8'));

//Make graph object
var graph = new Graph();
let global_names = [];
let global_choices = []
let gameover = 0
let start = 0

function get_rand(length)
{
    return Math.floor(Math.random() * length)
}

//Get a random name from the json file 
function get_name()
{
    var name = data.movies
    return name[get_rand(data.movies.length)].titles[0]
}

//Get a random name from the json file 
function get_start()
{
    var route = path.paths
    var pos = get_rand(route.length)
    var start = route[pos].start
    //var end = route[pos].end
    //var len = route[pos].length

    return { start, pos } 
}

//Get a random name from the json file 
function get_end(start_pos)
{
    var route = path.paths
    var pos = get_rand(route[start_pos].end.length)
    var end = route[start_pos].end[pos]
    //var end = route[pos].end
    //var len = route[pos].length

    return { end, pos } 
}

//Setup the nodes, graph, edges, parents, etc.
function setup()
{
    //Get the list of names from database
    var names = data.movies;

    //For each name make a new node
    for(var i = 0; i < names.length; i++)
    {
        var name = names[i].actor;
        var comics = names[i].titles;
        var nameNode = new Node(name);
        graph.addNode(nameNode);

        for(var j = 0; j < comics.length; j++)
        {
            var comic = comics[j];

            //Get the node for the comic
            var comicNode = graph.getNode(comic);

            //Check to see if the node exists so we dont make the same node twice
            if(comicNode == undefined)
            {
                //Make the node if we dont find it
                comicNode = new Node(comic);
            }

            graph.addNode(comicNode);
            nameNode.addEdge(comicNode);
        }
    }
}

//Get the first actor from the user
function get_start_input(message)
{
    let list_of_pos = []
    let list_of_names = []

    //Get 5 actors to select from
    for(var i = 1; i < 5; i++)
    {
        let option_path = get_start()

        let startName = option_path.start

        //let endName = option_path.end
        //let length = option_path.len

        list_of_pos.push(option_path.pos)
        list_of_names.push(startName)
    }
    
    //After getting the names build the embed with the names
    build_start_embed(message, list_of_names, list_of_pos)
}

function build_start_embed(message, list_of_names, list_of_pos)
{
    //Build the embed for the user who started the duel
    let embed = new Discord.MessageEmbed()
        .setTitle(`Welcome!`)
        .setDescription(`Select the first actor to start from! (Respond with 1-4)`)
        .addFields(
            {name: 'Starting Actor', value: `1. ${list_of_names[0]} \n 2. ${list_of_names[1]} \n 3. ${list_of_names[2]} \n 4. ${list_of_names[3]}`, inline:true},
        )
        .setColor(0x800080)
        .setTimestamp();

    //Add buttons so the user can select which style they want
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId("1")
            .setLabel("1")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("2")
            .setLabel("2")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("3")
            .setLabel("3")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("4")
            .setLabel("4")
            .setStyle("PRIMARY"),
    );

    message.channel.send({content: " ", embeds: [embed], components: [row]}).then(async msg => {

    //Make sure only the user who sent the message can respond
    const filter = (interaction) => {
        if(interaction.user.id === message.author.id) return true;
        return interaction.reply({content: "You cannot use this button."})
    };
    
    const collector = message.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 5
    })

    collector.on('collect', message => {
        //console.log(message.content)
    })

    collector.on('end', async collected => {
        if(collected === 0)
        {
            message.reply("You did not make a selection.")
        }

        let choice = collected.first().customId;
        choice -= 1

        //Defer the reply until image is made/converted
        await collected.first().deferReply();

        global_names.push(list_of_names[choice])

        get_end_input(message, list_of_pos[choice], msg)

        //After the image is done end the loading bar
        await collected.first().editReply({content:`You selected ${global_names[0]}`});

        });
        
        
    })

}

//Get the second actor from the user based on the first actor they choose
//TO:DO get selection from user and send to get_end
function get_end_input(message, start_actor_pos, msg)
{
    let list_of_pos = []
    let list_of_names = []

    for(var i = 1; i < 6; i++)
    {
        let option_path = get_end(start_actor_pos)

        let endName = option_path.end

        //let endName = option_path.end
        //let length = option_path.len

        list_of_pos.push(option_path.pos)
        list_of_names.push(endName)
        
    }

    //After getting the names build the embed with the names
    build_end_embed(message, list_of_names, list_of_pos, msg)
}

function build_end_embed(message, list_of_names, list_of_pos, msg)
{
    //Build the embed for the user who started the duel
    let embed = new Discord.MessageEmbed()
        .setTitle(`Welcome!`)
        .setDescription(`Select the second actor to go to! (Respond with 1-4)`)
        .addFields(
            {name: 'Ending Actor', value: `1. ${list_of_names[0]} \n 2. ${list_of_names[1]} \n 3. ${list_of_names[2]} \n 4. ${list_of_names[3]}`, inline:true},
        )
        .setColor(0x800080)
        .setTimestamp();

    //Add buttons so the user can select which style they want
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId("1")
            .setLabel("1")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("2")
            .setLabel("2")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("3")
            .setLabel("3")
            .setStyle("PRIMARY"),
        new MessageButton()
            .setCustomId("4")
            .setLabel("4")
            .setStyle("PRIMARY"),
    );

    msg.edit({content: " ", embeds: [embed], components: [row]}).then(async msg => {

    //Make sure only the user who sent the message can respond
    const filter = (interaction) => {
        if(interaction.user.id === message.author.id) return true;
        return interaction.reply({content: "You cannot use this button."})
    };
    
    const collector = message.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 5
    })

    collector.on('collect', message => {
        //console.log(message.content)
    })

    collector.on('end', async collected => {
        if(collected === 0)
        {
            message.reply("You did not make a selection.")
        }

    
        msg.edit({content: ' ',embeds: [embed]}).catch(console.error);
   
        
        let choice = collected.first().customId;
        choice -= 1

        //Defer the reply until image is made/converted
        await collected.first().deferReply();

        global_names.push(list_of_names[choice])

        start = Date.now()
        message.channel.send({content: "Result"}).then(async msg => {
            bfs(global_names[0], global_names[1], message, msg)
        });

        //After the image is done end the loading bar
        await collected.first().editReply({content:`You selected ${global_names[1]}`});
    
        })
    })
}

//Preform BFS on the graph that was setup
async function bfs(name1, name2, message, msg)
{
    graph.reset();

    //Set the start node and target node
    var start = graph.setStart(name1);
    var end = graph.setEnd(name2);

    //console.log("HERE",start, " ", end)
    //Make the queue
    var queue = [];
    

    //console.log(start)
    //To start set origin searched to true and add to queue
    start.searched = true;
    queue.push(start);

    //While we have not reached the end of our queue look for the end or target 
    while(queue.length > 0)
    {
        //Pop the item in the queue
        var current = queue.shift();

        //If the item is equal to our target end 
        if(current == end)
        {
            break
        }

        //Get the edges of current
        var edges = current.edges;

        //For each edge check its neighboors
        for(var i = 0; i < edges.length; i++)
        {
            //Get the neighboor
            var neighbor = edges[i]
            
            //If it has not been searched do it
            if(!neighbor.searched)
            {

                neighbor.searched = true;
                neighbor.parent = current;
                queue.push(neighbor);

            }
        }

    }
 
    //Get the path of nodes
    var path = []

    //Starting from the target back to the root
    path.push(end);

    //Find the parent of the current node
    var next = end.parent;

    //While a parent is found loop
    while(next != null)
    {
        //console.log(next.value)
        path.push(next);
        next = next.parent;
    }

    //Printing the result to the console
    var txt = '';
    for(var i = path.length-1; i>=0; i--)
    {
        var n = path[i];
        txt += n.value 
        if(i != 0)
        {
            txt += ' --> ';
        }
    }

    //If there is no path call bfs to find new set of names
    if(path.length == 1)
    {
        message.channel.send("You lose! Here was the answer!")

        //bfs(global_names[0], global_names[1], message, msg)
        //Send the answer to chat
        send_answer(message, txt)

        return
    }
    else if(path.length > 1)
    {
        //console.log(start.value, " ", end.value)

        //console.log(txt)

        //Send the answer to chat
        send_answer(message, txt)
        
    }

    global_names = []
}

//Preform BFS on the graph that was setup
async function user_bfs(name1, name2, message, msg)
{
    graph.reset();

    //Set the start node and target node
    var start = graph.setStart(name1);
    var end = graph.setEnd(name2);

    //console.log("HERE",start, " ", end)
    //Make the queue
    var queue = [];
    

    //console.log(start)
    //To start set origin searched to true and add to queue
    start.searched = true;
    queue.push(start);

    //While we have not reached the end of our queue look for the end or target 
    while(queue.length > 0)
    {
        //Pop the item in the queue
        var current = queue.shift();

        //If the item is equal to our target end 
        if(current == end)
        {
            break
        }

        //Get the edges of current
        var edges = current.edges;

        //For each edge check its neighboors
        for(var i = 0; i < edges.length; i++)
        {
            //Get the neighboor
            var neighbor = edges[i]
            
            //console.log(i + ". " + neighbor.value)
            

            //If it has not been searched do it
            if(!neighbor.searched)
            {
                global_choices.push(neighbor.value)
                //console.log(" ")

                neighbor.searched = true;
                neighbor.parent = current;
                queue.push(neighbor);

                
                
                if(typeof(neighbor.value) != 'number')
                {
                    
                    //console.log(i+ ". " +neighbor.value)
                   
                }   
            }
        }
        console.log("IN BFS: ",global_choices);

        if(global_choices.length == 0)
        {
            gameover = 1
            continue;
        }
        else(global_choices.length == 0 && gameover !=1 )
        {
            await get_bfs_choice(message, msg);
        }
        
    
    }
 
    //Get the path of nodes
    var path = []

    //Starting from the target back to the root
    path.push(end);

    //Find the parent of the current node
    var next = end.parent;

    //While a parent is found loop
    while(next != null)
    {
        path.push(next);
        next = next.parent;
    }

    //Printing the result to the console
    var txt = '';
    for(var i = path.length-1; i>=0; i--)
    {
        var n = path[i];
        txt += n.value 
        if(i != 0)
        {
            txt += ' --> ';
        }
    }

    //If there is no path call bfs to find new set of names
    if(path.length == 1)
    {
        message.channel.send("You lose! Here was the answer!")

        //bfs(global_names[0], global_names[1], message, msg)
        //Send the answer to chat
        send_answer(message, txt)

        return
    }
    else if(path.length > 1)
    {
        //console.log(start.value, " ", end.value)

        //console.log(txt)

        //Send the answer to chat
        send_answer(message, txt)
        
    }

    global_names = []
}

async function get_bfs_choice(message, msg)
{
    //Make a promise so the function get selection does not continue until this is done
    return new Promise((resolve, reject)  => {
         
        console.log("IN CHOICES: ",global_choices);

        //Build the embed for the user who started the duel

        let text = ' '
        for(let i = 0; i < global_choices.length; i++)
        {
            text += (i+1 + ". " +global_choices[i] + '\n');
        }

       
        let embed = new Discord.MessageEmbed()
            .setTitle(`Welcome!`)
            .setDescription(`You chose an option:`)
            .addFields(
                {name: 'Selection', value: `${text}`, inline:true},
            )
            .setColor(0x800080)
            .setTimestamp();

        
        msg.edit({content: ' ',embeds: [embed]}).catch(console.error);
        
        
        //Filter which embeds I care for
        const filter = (m) => m.author.id === message.author.id;
                
        const collector = message.channel.createMessageCollector({
            filter,
            max: 1,
            time: 1000 * 10
        })

        collector.on('collect', message => {
            console.log(message.content)
        })

        collector.on('end', collected => {
            if(collected === 0)
            {
                message.reply("You did not make a selection.")
            }

            let first_choice = ' '
            collected.forEach((message) => {
                first_choice = message.content

                if(first_choice == '1')
                {
                    console.log("You chose 1!");
                    bfs(global_choices[0], global_names[1], message, msg)
                }
            })

            first_choice--
            global_choices = []
            resolve();

            
        })     
        
        
    
    });
}

function send_answer(message, text)
{
    const stop = Date.now()

    let time = (stop - start)/1000
    

    //Build the embed for the user who started the duel
    let embed1 = new Discord.MessageEmbed()
        .setTitle(`Here is the path`)
        .setDescription(text)
        .setColor(0x800080)
        .setTimestamp();

    let embed2 = new Discord.MessageEmbed()
        .setTitle(`How it works`)
        .setDescription(`Breadth First Search is used in order to find the connection between two actors.`)
        .setThumbnail('https://victorqi.gitbooks.io/swift-algorithm/content/Images/AnimatedExample.gif')
        .addFields(
            { name:"Execution Time:", value: `${time} seconds`, inline: false},
            { name:"Average Time:", value: `0.136 seconds`, inline: false}
        )
        .setColor(0x800080)
        .setTimestamp();
    
    let embed3 = new Discord.MessageEmbed()
        .setTitle(`Credits`)
        .setDescription(`This program was implemented by Jordan Black and Sunil Babu.`)
        .addFields(
            { name:"Github:", value: `https://github.com/StickyJorden/IMDBBot`, inline: false},
        )
        .setColor(0x800080)
        .setTimestamp();
    
    const button1 = new MessageButton()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle('DANGER');

    const button2 = new MessageButton()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle('SUCCESS');

    pages = [
        embed1,
        embed2,
        embed3
    ];

    buttonList = [
        button1,
        button2
    ]

    timeout = 120000
    paginationEmbed(message, pages, buttonList, timeout);
}

module.exports = {
    name: "imdb",
    alias: ["actor", "movie"],
    description: 'find the shortest path between two actors',
    run: async (client, message, args) => { 

      setup()

      get_start_input(message)  
      
    }
  }
  
