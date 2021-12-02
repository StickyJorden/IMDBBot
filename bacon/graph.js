function Graph()
{
    this.nodes = [];
    this.graph = {};
    this.end = null;
    this.start = null;
}

//Set where to start the search
Graph.prototype.setStart = function (name)
{
    this.start = this.graph[name]
    return this.start
}

//Set the goal node
Graph.prototype.setEnd = function (name)
{
    this.end = this.graph[name]
    return this.end
}

Graph.prototype.addNode = function (n)
{
    //Add node to the nodes
    this.nodes.push(n);

    //Get the name of the character
    var name = n.value;

    //Add character name to graph array
    this.graph[name] = n
}

//Check to see if the node exists
Graph.prototype.getNode = function (comic)
{
    var result = this.graph[comic];
    return result;
}

//Reset the graph on every bfs run
Graph.prototype.reset = function()
{
    for (var i = 0; i < this.nodes.length; i++)
    {
        this.nodes[i].searched = false
        this.nodes[i].parent = null
    }
}

module.exports = { Graph }