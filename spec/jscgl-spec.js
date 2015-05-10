var app = require("../app.js");
var World = app.World;


describe("world", function() {
   var canvasNode = "fake canvas";
   var world = new World(3, 5, canvasNode);

   it("can set and reset cells", function() {
      world.setCell(0, 0, true);
      expect(world.liveCells).toEqual({0:{0:true}});

      world.setCell(1, 0);
      expect(world.liveCells).toEqual({0:{0:true}, 1:{0:true}});

      world.setCell(0, 1);
      expect(world.liveCells).toEqual({0:{0:true, 1:true}, 1:{0:true}});

      world.setCell(1, 1, true);
      expect(world.liveCells).toEqual({0:{0:true, 1:true}, 1:{0:true, 1:true}});

      world.setCell(2, 4);
      expect(world.liveCells).toEqual({0:{0:true, 1:true}, 1:{0:true, 1:true}, 2:{4:true}});

      world.setCell(0, 0, false);
      expect(world.liveCells).toEqual({0:{1:true}, 1:{0:true, 1:true}, 2:{4:true}});

      world.reset();
      expect(world.liveCells).toEqual({});

      world.setCell(0, 0, true);
      expect(world.liveCells).toEqual({0:{0:true}});
   });

   it("can check for life", function() {
      world.reset();
      world.setCell(0, 1);
      world.setCell(1, 1);
      world.setCell(2, 1);

      count = world.checkForLife(0,1);
      count = world.checkForLife(1,1);
      count = world.checkForLife(2,1);

      expect(world.deadCellEncounters).toEqual({0:{0:2, 2:2}, 1:{0:3, 2:3}, 2:{0:2, 2:2}, 3:{0:1, 1:1, 2:1}});
   });

   it("can reproduce", function() {
      world.reproduce();
      expect(world.nextGeneration).toEqual({1:{0:true, 1:true, 2:true}});
   });
   
   it("can generate a generation", function() {
      world.reset();
      world.setCell(0, 1);
      world.setCell(1, 1);
      world.setCell(2, 1);
      expect(world.liveCells).toEqual({0:{1:true}, 1:{1:true}, 2:{1:true}});
      world.step();
      expect(world.liveCells).toEqual({1:{0:true, 1:true, 2:true}});
   });
});
