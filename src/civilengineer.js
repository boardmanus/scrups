/*
 * A civil engineer that takes care of roading and infrastructure issues
 */

const u = require('utils');

const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';
const TERRAIN_WALL = 'wall';
const CONSTRUCT_THRESHOLD = 150;
const DESTRUCT_THRESHOLD = 10;
const TIME_NEW_ROAD_REPORT = 10000;


function movementCostAt(room, x, y) {
  const t = room.lookForAt(LOOK_TERRAIN, x, y)[0];

  if (t === TERRAIN_PLAIN) {
    return 1;
  } else if (t === TERRAIN_SWAMP) {
    return 3;
  }

  return 0;
}


/**
 * Create a grid of the room that the civil engineer will use to keep track of
 * where roads should be added (or removed).
 * @param the room in question
 * @return the grid
 */
function createGrid(room) {
  let cost = 0;
  const grid = new Array(ROOM_HEIGHT);
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    const row = new Array(ROOM_WIDTH);
    grid[y] = row;
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      cost = movementCostAt(room, x, y);
      row[x] = { steps: 0, totalSteps: 0, cost };
    }
  }
  return grid;
}


function generateRoadPositions(eng, constructThreshold, destructThreshold, total) {
  const roads = { new: [], obsolete: [] };
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      const info = eng.movementGrid[y][x];
      const steps = (total ? info.totalSteps : info.steps);
      const road = eng.city.room.lookForAt(LOOK_STRUCTURES, x, y).find((s) =>
        s.structureType === STRUCTURE_ROAD);
      if (!road && steps >= constructThreshold) {
        roads.new.push({ x, y });
      } else if (road && steps <= destructThreshold) {
        roads.obsolete.push({ x, y });
      }
    }
  }

  return roads;
}


function constructRoads(room, locations) {
  locations.forEach((pos) => {
    const res = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
    if (res !== 0) {
      console.log(`Failed to construct road @ (${pos.x}, ${pos.y}) - err=${res}`);
    }
  });
}


/**
 * Sets about marking roads that should be destroyed.
 */
function deconstructRoads(room, locations, destroyRoads) {
  locations.forEach((pos) => {
    if (destroyRoads) {
      const roads = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y).filter((s) =>
        s.structureType === STRUCTURE_ROAD);
      if (roads.length > 0) {
        console.log(`Destroying ${u.name(roads[0])}`);
        roads[0].destroy();
      }
    } else {
      const name = `Dismantle-${pos.x}x${pos.y}-${STRUCTURE_ROAD}`;
      const res = room.createFlag(pos.x, pos.y, name, COLOR_RED);
      if (res !== name) {
        console.log(`Failed to mark road destruction @ (${pos.x}, ${pos.y}) - err=${res}`);
      }
    }
  });
}


/**
 * Resets the statistics on the movement grid.
 */
function resetMovementGrid(eng) {
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      eng.movementGrid[y][x].steps = 0;
    }
  }
  eng.startTime = Game.time;
  eng.city.room.memory.movementGridTime = eng.startTime;
}


/**
 * Provides an ascii representation of the given tile.
 * @return the tile representation.
 */
function roadTileReport(eng, x, y, constructThreshold, destructThreshold, total) {
  const pos = eng.movementGrid[y][x];
  const steps = (total ? pos.totalSteps : pos.steps);

  const allstuff = eng.city.room.lookAt(x, y);
  for (let i = 0; i < allstuff.length; ++i) {
    const stuff = allstuff[i];
    if (stuff.type === LOOK_TERRAIN) {
      if (stuff.terrain === TERRAIN_WALL) {
        return 'W';
      }
    } else if (stuff.type === LOOK_STRUCTURES) {
      switch (stuff.structure.structureType) {
        case STRUCTURE_WALL: return 'W';
        case STRUCTURE_CONTROLLER: return 'C';
        case STRUCTURE_SPAWN: return 'S';
        case STRUCTURE_EXTENSION: return 'E';
        case STRUCTURE_LAB: return 'L';
        case STRUCTURE_LINK: return 'l';
        case STRUCTURE_CONTAINER:
        case STRUCTURE_STORAGE: return 's';
        case STRUCTURE_TOWER: return 'T';
        default: break;
      }

      if (stuff.structure.structureType === STRUCTURE_ROAD) {
        if (steps <= destructThreshold) {
          return '-';
        }

        return 'r';
      }
    }
  }

  if (steps >= constructThreshold) {
    return '+';
  }

  return ' ';
}


/**
 * Retrieves the Civil Engineer for a room
 * @param roomName the name of the room to get him from
 * @return the Civil Engineer, or null if not found.
 */
function getCivilEngineer(roomName) {
  const room = Game.rooms[roomName];
  if (!room) {
    return null;
  }

  const city = room.city;
  if (!city) {
    return null;
  }

  return city.civilEngineer;
}


/**
 * Create a fully-fledged set of options based on the user set
 * @param options the user options
 * @return the filled in options with missing defaults
 */
function roadingOptions(options = null) {
  const opts = _.defaults(options || {}, {
    constructThreshold: CONSTRUCT_THRESHOLD,
    destructThreshold: DESTRUCT_THRESHOLD,
    total: false,
    destroyRoads: false,
  });

  // Ensure the thresholds are sane
  if (opts.destructThreshold >= opts.constructThreshold) {
    opts.constructThreshold = opts.destructThreshold + 1;
  }

  return opts;
}


const CivilEngineer = class CivilEngineer {

  /**
   * Creates a new Civil Engineer responsible for road works and infrastructure
   * in the city.
   */
  constructor(city) {
    this.city = city;
  }

  audit() {
    if (!this.city.room.memory.movementGrid) {
      this.city.room.memory.movementGrid = createGrid(this.city.room);
      this.city.room.memory.movementGridTime = Game.time;
    }
    this.startTime = this.city.room.memory.movementGridTime;
    this.movementGrid = this.city.room.memory.movementGrid;
  }

  /**
   * Reports creep movement to the civil engineer for future use.
   * @param the creep moving on the grid
   * @return the current steps on that position.
   */
  registerMovement(creep) {
      /*
    const gridPos = this.movementGrid[creep.pos.y][creep.pos.x];
    gridPos.steps += gridPos.cost;
    gridPos.totalSteps += gridPos.cost;
    return gridPos.steps;
    */
  }


  /**
   * Provide a report on the state of the roads.
   * @param options options influencing the report results
   */
  roadReport(options = null) {
    const opts = roadingOptions(options);

    for (let y = 0; y < ROOM_HEIGHT; ++y) {
      let row = '';
      for (let x = 0; x < ROOM_WIDTH; ++x) {
        row += roadTileReport(
          this, x, y, opts.constructThreshold, opts.destructThreshold, opts.total);
      }
      console.log(row);
    }
  }


  /**
   * Perform roadworks based on the given options
   * @param options options influencing the road works
   */
  roadWorks(options = null) {
    const opts = roadingOptions(options);

    const roadPositions = generateRoadPositions(
      this,
      opts.constructThreshold,
      opts.destructThreshold,
      opts.total);

    console.log(`${roadPositions.new.length} roads to construct, ${roadPositions.obsolete.length} roads to destroy`);
    constructRoads(this.city.room, roadPositions.new);
    deconstructRoads(this.city.room, roadPositions.obsolete, opts.destroyRoads);
  }


  /**
   * Perform all the civil engineers duties
   */
  run() {
    const dt = Game.time - this.startTime;
    if (dt > TIME_NEW_ROAD_REPORT) {
      this.roadWorks();
      resetMovementGrid(this);
    }
  }
};


/**
 * Monkey patch the base game classes to provide easier access to important
 * functionality.
 */
CivilEngineer.monkeyPatch = function monkeyPatch() {
  /**
   * Add an easy way to get a roading report from the civil engineer
   */
  Game.report.road = function roadReport(roomName, options = null) {
    const civilEngineer = getCivilEngineer(roomName);
    if (!civilEngineer) {
      console.log(`Can't generate roading report - no civil engineer for room ${roomName}`);
      return;
    }
    civilEngineer.roadReport(options);
  };


  /**
   * Add an easy way to apply road works to a city
   */
  Game.cmd.roadWorks = function roadWorks(roomName, options = null) {
    const civilEngineer = getCivilEngineer(roomName);
    if (!civilEngineer) {
      console.log(`Can't generate roading report - no civil engineer for room ${roomName}`);
      return;
    }
    civilEngineer.roadWorks(options);
  };


  /**
   * Remove all the road works flags from the room
   */
  Game.cmd.removeRoadWorkSigns = function removeRoadWorkSigns(roomName) {
    const room = Game.rooms[roomName];
    if (room === null) {
      console.log(`${u.name(room)} doesn't seem to exist.`);
      return;
    }

    const flags = room.find(FIND_FLAGS, { filter: (f) =>
      f.name.search(/Dismantle-.*-road/) !== -1,
    });

    _.each(flags, (f) => f.remove());
  };
};


module.exports = CivilEngineer;
