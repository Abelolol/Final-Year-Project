var edges;
var nodes;
var nodeCount = 0;
var network;
var delay = 1000;
var paused = true;
var pausedID;

var DFStates =  [{
      visited: [],
      queue: [1],
      currentNode: null,
      adjacentNodes: null,
      completed: false
}]

var BFStates =  [{
      visited: [],
      queue: [1],
      currentNode: null,
      adjacentNodes: null,
      completed: false
}]

var DJStates =  [{
      visited: [],
      distance: {},
      pQueue: {},
      currentNode: 1,
      adjacentNodes: [],
      nodeIds: [],
      completed: false
}]

function addNode() {
      // Adds a new node to canvas
      nodeCount++;
      nodes.add({id: nodeCount, label: nodeCount.toString()});
      network.selectNodes([nodeCount]);

      // Add node ID to select box (for adding edges)
      var select = document.getElementById("select");
      var option = document.createElement("option");
      option.value = nodeCount;
      option.text = nodeCount.toString();
      select.appendChild(option);
      
}

function deleteNode() {
      network.deleteSelected();
}

function addEdge(){
      var selectElement = document.getElementById("select");
      var select = selectElement.value;
      var currentNode = network.getSelectedNodes()[0];
      var selectedNode = nodes.get(parseInt(select));

      var length = document.getElementById('length');
      var elength = length.value;


      var newEdge = { from: selectedNode.id, to: currentNode, label: elength, arrows: { to: { enabled: true }}};
      edges.add(newEdge);
}

function sleep(delay) {
      return new Promise((resolve) => setTimeout(resolve, delay));
}

function chooseAlgo(x){
      var next = document.getElementById("next");
      var back = document.getElementById("back");
      var header = document.getElementById("functionHeader");
      var pause = document.getElementById("pause");
      next.style.display = "inline-block";
      back.style.display = "inline-block";
      pause.style.display = "inline-block";
      pause.onclick = function() {
            togglePause(x);
      };
      if (x == 'BF'){
            next.onclick = breadthFirstForward;
            back.onclick = breadthFirstBackward;
            header.innerHTML = "Running Breadth First Algorithm"
      } else if (x == 'DF'){
            next.onclick = depthFirstForward;
            back.onclick = depthFirstBackward;
            header.innerHTML = "Running Depth First Algorithm"
      }
      else if (x == 'DIJK'){
           dijkSetup();
            next.onclick = dijkstraForward;
            back.onclick = dijkstraBackward;
            header.innerHTML = "Running Dijkstra's Algorithm"
      }
}

function breadthFirstBackward() {
      if (BFStates.length == 1){
            nodes.update({ id: 1, color: "red" });
            return;
      }
      BFStates.pop();
      var prev = BFStates[BFStates.length -1];
      
      for (var i = 0; i< nodes.length; i++){
            nodes.update({ id: i+1, color: "lightblue" });
      }

      for (var i = 0; i< prev.queue.length; i++){
            nodes.update({ id: prev.queue[i], color: "gray" });
      }

      for (var i = 0; i< prev.visited.length; i++){
            nodes.update({ id: prev.visited[i], color: "red" });
      }
}

function breadthFirstForward(){
      if (BFStates[BFStates.length -1].visited.length == nodes.length){
            BFStates[BFStates.length -1].completed = true;
            return;
      }
      if (BFStates[BFStates.length -1].completed == true){
            return
      }
      // create copy to preserve previous state
      var newState = structuredClone(BFStates[BFStates.length -1]);
      // Visiting the first node in the queue
      newState.currentNode = newState.queue.shift();
      newState.visited.push(newState.currentNode);
      //await sleep(delay);
      nodes.update({ id: newState.currentNode, color: "red" });

      // Add adjacentNodes into queue
      newState.adjacentNodes = network.getConnectedNodes(newState.currentNode, { direction: "to" });
      if(newState.adjacentNodes.length != 0){
            for (let i = 0; i < newState.adjacentNodes.length; i++) {
                  if (!newState.visited.includes(newState.adjacentNodes[i])){
                        // add unvisited nodes to the queue
                        newState.queue.push(newState.adjacentNodes[i]);
                        nodes.update({id: newState.adjacentNodes[i], color: "gray"});
                  }
            }
            newState.adjacentNodes = [];
      }
      BFStates.push(newState);
}

function depthFirstBackward(){
      if (DFStates.length == 1){
            nodes.update({ id: 1, color: "red" });
            return;
      }
      DFStates.pop();
      var prev = DFStates[DFStates.length -1];
      
      for (var i = 0; i< nodes.length; i++){
            nodes.update({ id: i+1, color: "lightblue" });
      }

      for (var i = 0; i< prev.queue.length; i++){
            nodes.update({ id: prev.queue[i], color: "gray" });
      }

      for (var i = 0; i< prev.visited.length; i++){
            nodes.update({ id: prev.visited[i], color: "red" });
      }
}

function depthFirstForward(){
      if (DFStates[DFStates.length-1].visited.length == nodes.length){
            DFStates[DFStates.length-1].completed = true;
            return;
      }
      if (DFStates[DFStates.length-1].completed == true){
            return
      }
      // create copy to preserve previous state
      var newState = structuredClone(DFStates[DFStates.length -1]);
      // Visiting the first node in the queue
      newState.currentNode = newState.queue.shift();
      newState.visited.push(newState.currentNode);
      //await sleep(delay);
      nodes.update({ id:newState.currentNode, color: "red" });

      // Add adjacentNodes into queue
      newState.adjacentNodes = network.getConnectedNodes(newState.currentNode, { direction: "to" });
      if(newState.adjacentNodes.length != 0){
            newState.adjacentNodes.reverse(); // reverse the list to make it visit left most nodes first (for consistency with BF)
            for (let i = 0; i < newState.adjacentNodes.length; i++) {
                  if (!newState.visited.includes(newState.adjacentNodes[i])){
                        // add unvisited nodes to the queue
                        newState.queue.unshift(newState.adjacentNodes[i]);
                        //await sleep(delay);
                        nodes.update({id: newState.adjacentNodes[i], color: "gray"});
                  }
            }
            newState.adjacentNodes = [];
      }
      DFStates.push(newState);
}

function togglePause(x) {
      if (x == "BF"){
            if (paused) {
                  pausedID = setInterval(breadthFirstForward, delay);
                  paused = false;
                } else {
                  clearInterval(pausedID);
                  paused = true;
            }
      } else if (x == "DF"){
            if (paused) {
                  pausedID = setInterval(depthFirstForward, delay);
                  paused = false;
                } else {
                  clearInterval(pausedID);
                  paused = true;
            }
      } else if (x == "DIJK"){
            if (paused) {
                  pausedID = setInterval(dijkstraForward, delay);
                  paused = false;
                } else {
                  clearInterval(pausedID);
                  paused = true;
            }
      
      }
}
function dijkSetup(){
      DJStates[DJStates.length -1].nodeIds = nodes.get().map(function (node) { return node.id; });
      for (var i = 0; i < DJStates[DJStates.length -1].nodeIds.length; i++) {
            DJStates[DJStates.length -1].distance[i + 1] = Number.MAX_VALUE;
      }
      DJStates[DJStates.length -1].distance[DJStates[DJStates.length -1].currentNode] = 0;
      DJStates[DJStates.length -1].pQueue[DJStates[DJStates.length -1].currentNode] = DJStates[DJStates.length -1].distance[DJStates[DJStates.length -1].currentNode];
}
function dijkstraBackward(){
      console.log("test");
      if (DJStates.length == 1){
            nodes.update({ id: 1, color: "red" });
            return;
      }
      DJStates.pop();
      var prev = DJStates[DJStates.length -1];
      
      for (var i = 1; i <= nodeCount; i++){
            nodes.update({ id: i, color: "lightblue" });
      }
      for (var i = 0; i< prev.visited.length; i++){
            if (prev.visited[i] <= nodeCount){
                  nodes.update({ id: prev.visited[i], color: "red" });
            }
      }

      var resultElement = document.getElementById("results");
      var resultText = "Distances: <br>";
      for (var key in prev.distance) {
            value = prev.distance[key]
            if (value == Number.MAX_VALUE){
                  value = "Not yet reached"
            }
            resultText += key+ " = "+ value + "<br>";
      }
      resultElement.innerHTML = resultText;

}

function dijkstraForward(){
      
      if (DJStates[DJStates.length -1].visited.length === DJStates[DJStates.length -1].nodeIds.length) {
            DJStates[DJStates.length -1].completed = true;
            return;
      }
      if (DJStates[DJStates.length -1].completed === true) {
            return;
      }

      // Create new state to not affect previous state
      var newState = structuredClone(DJStates[DJStates.length -1])

      // Find the node with the smallest distance and set it to current node
      var smallestValue = Number.MAX_VALUE;
      var smallestKey;
      for (var key in newState.pQueue) {
            if (newState.pQueue[key] < smallestValue) {
                  smallestValue = newState.pQueue[key];
                  smallestKey = key;
            }
      }
      newState.currentNode = smallestKey;
      delete newState.pQueue[smallestKey];

      if (!newState.visited.includes(newState.currentNode)) {
            newState.visited.push(newState.currentNode);

            // change current node to red
            var nodePosition = network.getPositions([newState.currentNode])[newState.currentNode];
            nodes.update({ id:newState.currentNode, color: "red" });
            network.moveNode(newState.currentNode, nodePosition.x, nodePosition.y);  

            // Get edges of current node and visit the shortest edge
            newState.adjacentNodes = network.getConnectedEdges(newState.currentNode);
            for (var i = 0; i < newState.adjacentNodes.length; i++) {
                  var edge = edges.get(newState.adjacentNodes[i]);
                  if (!newState.visited.includes(edge.to)) {
                        // update distance
                        var tDistance = newState.distance[newState.currentNode] + parseInt(edge.label);
                        if (tDistance < newState.distance[edge.to]) {
                              newState.distance[edge.to] = tDistance;
                              newState.pQueue[edge.to] = tDistance;
                        }
                  }
            }
            newState.adjacentNodes = [];
      }
      DJStates.push(newState);

      var resultElement = document.getElementById("results");
      var resultText = "Distances: <br>";
      for (var key in newState.distance) {
            value = newState.distance[key]
            if (value == Number.MAX_VALUE){
                  value = "Not yet reached"
            }
            resultText += key+ " = "+ value + "<br>";
      }
      resultElement.innerHTML = resultText;
}

function readFile() {
      var fileInput = document.getElementById("file");
      var file = fileInput.files[0];
      var reader = new FileReader();
    
      reader.onload = function (event) {
            // Split file line by line
            var lines = event.target.result.split("\n");
             for (var line of lines) {
                  var lineSplit = line.split(" ");
                  if (lineSplit[0] =="p"){

                       var numNodes = lineSplit[2];
                       nodeCount = numNodes;
                       for (var i = 1; i <= numNodes; i++){
                              nodes.add({id: i, label: i.toString()});
                       }

                  } else if (lineSplit[0] == "e"){
                        var newEdge = { from: parseInt(lineSplit[1]), to: parseInt(lineSplit[2]), label: lineSplit[3],arrows: { to: { enabled: true }}};
                        edges.add(newEdge);
                  }
            }
            for (var i = 1; i <= nodeCount; i++){
                  var select = document.getElementById("select");
                  var option = document.createElement("option");
                  option.value = i;
                  option.text = i ;
                  select.appendChild(option);
            }
      };
      reader.onerror = function (event) {
            console.error("File not found: ", event);
      };
    
      reader.readAsText(file);
}

window.onload = function() {
      nodes = new vis.DataSet([
      ]);
      
      edges = new vis.DataSet([
      ]);

      // create a network
      var container = document.getElementById("mynetwork");
      var data = {
            nodes: nodes,
            edges: edges,
      };
      var options = {
            autoResize: true,
            height: '100%',
            width: '100%',
            locale: 'en',
            edges: {
                  arrows: {
                        to: {
                              enabled: true,
                              scaleFactor: 1,
                        },
                  },
                  smooth: {
                        enabled: false,
                  },
                  font: {
                        size: 14,
                        color: 'black' // change the color of the font
                      },
                  labelHighlightBold: true,
            },
            nodes: {
                  color: 'lightblue',
                  shape: 'dot',
                  scaling: {
                        min: 10,
                        max: 30,
                  },
                  font: {
                        size: 12,
                        face: 'Tahoma',
                  },
                  labelHighlightBold: false,
                  borderWidthSelected: 10,
                  chosen: {
                        node: function (node, isSelected, selectedNodes) {
                        if (isSelected) {
                        node.borderColor = "black";
                        } else {
                        node.borderColor = undefined;
                        }
                        }
                  }
            },
            layout: {
                  hierarchical: {
                        enabled: true,
                        direction: 'UD',
                        sortMethod: 'directed',
                        levelSeparation: 200,
                        nodeSpacing: 100,
                  },
            },
            physics: {
                  enabled: false,
            },
            interaction: {
                  dragNodes: true,
                  multiselect: true,
                  navigationButtons: true,
                  zoomView: false,
            },
      };

      nodeCount = nodes.length
      for (var i = 1; i <= nodeCount; i++){
            var select = document.getElementById("select");
            var option = document.createElement("option");
            option.value = i;
            option.text = i ;
            select.appendChild(option);
      }


      network = new vis.Network(container, data, options);
      network.on('dragStart', function (params) {
            // Disable the hierarchical layout when a node is being dragged
            network.setOptions({
              layout: {
                hierarchical: {
                  enabled: false,
                },
              },
            });
          });
};