/* world: Contains the state of the game and methods to alter its state. */
var World = function(canvas) {

   //PRIVATE METHODS AND INSTANCES
   
   var self = this;

   var clearCell = function(x, y) {
      var context = self.canvas.getContext("2d");
      var size = self.canvas.width / self.numCols;
      context.fillStyle = "#9cf";
      context.fillRect(size * x, size * y, size, size);

   }

   var drawCell = function(x, y) {
      var context = self.canvas.getContext("2d");
      var size = self.canvas.width / self.numCols;
      context.fillStyle = "#ca4";
      context.fillRect(size * x, size * y, size, size);

   }


   // starting size of the grid
   this.numCols = 20;
   this.numRows = 20;

   // canvas element, passed in on DOM load
   this.canvas = canvas;

   // current generation of living cells.
   // Stored using object key values for rapid lookup
   this.liveCells = {};

   // non-living neighbour cells.
   this.deadCellEncounters = {};

   // the next generation of cells, to replace liveCells upon completing a step.
   this.nextGeneration = {};

   // resets the world to an initial state and redraws
   this.reset = function() {
      this.liveCells = {};
      this.deadCellEncounters = {};
      this.nextGeneration = {};
      this.initDrawing();
   }

   this.setGridSize = function(size) {
      self.numCols = size;
      self.numRows = size;
   }

   // finds user clicks on canvas and toggles living state of appropriate cell
   this.canvas.addEventListener('click', function(event) {
      var canvasWidth = getComputedStyle(this).getPropertyValue('width').slice(0,-2);
      var canvasX = this.offsetLeft;
      var canvasY = this.offsetTop;

      var size = canvasWidth / self.numCols;
      var x = Math.floor((event.pageX - canvasX) / size);
      var y = Math.floor((event.pageY - canvasY) / size);

      self.setCell(x, y, "toggle");
   });

   // runs checks on neighbours of a living cell to see if the cell in question
   // survives or dies. Adds any dead cells found to deadCellEncounters to later
   // check for reproduction conditions
   this.checkForLife = function(x, y) {
      //x and y come from keys, so we need to convert them to numbers;
      x = +x;
      y = +y;

      //accounting for the current cell, which is always live
      //this is more efficient than checking for a middle cell
      var liveCount = -1; 

      //constraining i and j to be in the world and within 1 unit of x and y
      for (var i = Math.max(0, x-1); (i <= x+1) && (i <= self.numCols); i++) {
         for (var j = Math.max(0, +y-1); (j <= +y+1) && (j <= self.numRows); j++) {
            if (self.liveCells[i] && self.liveCells[i][j]) {
               liveCount++;
            }
            else {
               self.deadCellEncounters[i] = self.deadCellEncounters[i] || {};
               if (typeof(self.deadCellEncounters[i][j]) === "undefined") {
                  self.deadCellEncounters[i][j] = 1;
               }
               else {
                  self.deadCellEncounters[i][j]++;
               }
            }
         }
      }
      if (liveCount === 2 || liveCount === 3) {
         self.nextGeneration[x] = self.nextGeneration[x] || {};
         self.nextGeneration[x][y] = true;
      }
      return liveCount;
   }

   // any dead cells with 3 neighbours become living
   this.reproduce = function() {
      for (var x in self.deadCellEncounters) {
         for (var y in self.deadCellEncounters[x]) {
            if (self.deadCellEncounters[x][y] === 3) {
               self.nextGeneration[x] = self.nextGeneration[x] || {};
               self.nextGeneration[x][y] = true;
            }
         }
      }
   }



   this.initDrawing = function() {
      var context = self.canvas.getContext("2d");
      context.fillStyle = "#9cf";
      context.fillRect(0,0, self.canvas.width, self.canvas.height);
   }


   this.step = function() {
      //neighbours < 2 -> dead
      //neighbours > 3 -> dead
      //2 <= neighbours <= 3 -> stays live
      //neighbours == 3 -> becomes live

      self.nextGeneration = {};
      self.deadCellEncounters = {};
      self.initDrawing();

      for (var x in self.liveCells) {
         for (var y in self.liveCells[x]) {
            self.checkForLife(x, y);
            drawCell(x,y);
         }
      }

      self.reproduce();
      self.liveCells = self.nextGeneration;
   }

   this.setCell = function(x, y, isLive) {
      console.assert(x <= self.numCols && y <= self.numRows, "invalid placement");

      if (isLive === undefined) isLive = true;

      this.liveCells[x] = this.liveCells[x] || {};

      if (isLive === "toggle") {
         if (this.liveCells[x][y]) {
            isLive = false;
         }
         else isLive = true;
      }

      if (isLive) {
         this.liveCells[x][y] = true;
         drawCell(x,y)
      }

      else {
         delete this.liveCells[x][y];
         clearCell(x,y)
      }

   }

   return this;
}

/* Timer: manages generation count and time elapsed */
var Timer = function(incrementFunction, msIncrement, timerElement, generationElement) {

   var generation = 0;
   var interval;
   var start;
   var currentTime;

   //runs timer constantly, updates generation every second.
   this.start = function() {
      start = currentTime = new Date().getTime();
      interval = setInterval(function() {
         currentTime = new Date().getTime() - start;
         timerElement.innerHTML = currentTime;
   
         if (currentTime / 1000 > generation) {
            incrementFunction();
            generationElement.innerHTML = ++generation;
         }

      }, 0);
   }

   this.stop = function() {
      clearInterval(interval);
      generation = 0;
      time = 0;
      start = 0;
      timerElement.innerHTML = 0;
      generationElement.innerHTML = 0;
   }

   return this;
}

var timer;

//changes grid size and resets game and timer
var setGridSize = function(world) {

   var gridSizeInput = document.querySelector("input[name=gridsize]");
   if (gridSizeInput.value > 200) {
      alert("The grid is too large! Try a smaller size.");
   }

   stopGame();
   world.setGridSize(gridSizeInput.value);
}

//resets game and timer
var stopGame = function() {
   world.reset();
   timer.stop();
}

window.onload = function() {
   var generation = 0;
   world = new World(document.getElementById("world"));
   world.initDrawing();
   
   timer = new Timer(world.step, 1000, 
         document.getElementById("timer"), document.getElementById("generation"));
}

if (module) {
   module.exports = {
      World: World
   }
}
