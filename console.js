const { Graph } = require("./bacon/graph.js"); 
const { Node } = require("./bacon/node.js"); 
const fs = require('fs');

//We can call the JSON file for marvel database
const data = JSON.parse(fs.readFileSync('bacon/movie.json','utf8'));

//We can call the JSON file for marvel database
const path = JSON.parse(fs.readFileSync('bacon/start_end_points.json','utf8'));

//Make graph object
var graph = new Graph();
let global_names = [];

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
function get_start_input()
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
    build_start_embed(list_of_names, list_of_pos)
}

function build_start_embed(list_of_names, list_of_pos)
{
    console.log(`Using the first actor ${list_of_names[0]} to start from.`)
    
    global_names.push(list_of_names[0])

    get_end_input(list_of_pos[0])

}

//Get the second actor from the user based on the first actor they choose
//TO:DO get selection from user and send to get_end
function get_end_input(start_actor_pos)
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
    build_end_embed(list_of_names, list_of_pos)
}

function build_end_embed(list_of_names, list_of_pos)
{
    console.log(`Using the second actor ${list_of_names[0]} to end at.`)
    
    global_names.push(list_of_names[0])

    bfs(global_names[0], global_names[1])
}

//Preform BFS on the graph that was setup
async function bfs(name1, name2)
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
        return
    }
    else if(path.length > 1)
    {
        console.log(txt)
    }

    global_names = []
}

//Setup the graph
setup()

//begin bfs with actors
get_start_input()  
   