/*
 * A civil engineer that takes care of roading and infrastructure issues
 */

const u = require('utils');

const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';
const TERRAIN_WALL = 'wall';
const BUILD_STEP_THRESHOLD = 20;
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


function generateRoadPositions(eng, constructThreshold, destructThreshold) {
  const roads = { new: [], obsolete: [] };
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      const info = eng.movementGrid[y][x];
      const road = eng.city.room.lookForAt(LOOK_STRUCTURES, x, y).find((s) =>
        s.structureType === STRUCTURE_ROAD);
      if (!road && info.steps >= constructThreshold) {
        roads.new.push({ x, y });
      } else if (road && info.steps <= destructThreshold) {
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


function resetMovementGrid(eng) {
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      eng.movementGrid[y][x].steps = 0;
    }
  }
  eng.startTime = Game.time;
  eng.city.room.memory.movementGridTime = eng.startTime;
}


function roadReport(eng, x, y, flags = null) {
  const pos = eng.movementGrid[y][x];
  let total = false;
  let constructThreshold = BUILD_STEP_THRESHOLD;
  let destructThreshold = 0;
  if (flags) {
    total = flags.total || false;
    constructThreshold = flags.constructThreshold || BUILD_STEP_THRESHOLD;
    destructThreshold = flags.destructThreshold || 0;
  }
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
        if (pos.steps <= destructThreshold) {
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

const CivilEngineer = class CivilEngineer {

  constructor(city) {
    this.city = city;
    if (!city.room.memory.movementGrid) {
      city.room.memory.movementGrid = createGrid(city.room);
      city.room.memory.movementGridTime = Game.time;
    }
    this.startTime = city.room.memory.movementGridTime;
    this.movementGrid = city.room.memory.movementGrid;
  }

  /**
   * Reports creep movement to the civil engineer for future use.
   * @param the creep moving on the grid
   * @return the current steps on that position.
   */
  registerMovement(creep) {
    const gridPos = this.movementGrid[creep.pos.y][creep.pos.x];
    gridPos.steps += gridPos.cost;
    gridPos.totalSteps += gridPos.cost;
    return gridPos.steps;
  }

  roadingReport(flags = null) {
    for (let y = 0; y < ROOM_HEIGHT; ++y) {
      let row = '';
      for (let x = 0; x < ROOM_WIDTH; ++x) {
        row += roadReport(this, x, y, flags);
      }
      console.log(row);
    }
  }

  applyRoadPositions(flags = null) {
    let constructThreshold = BUILD_STEP_THRESHOLD;
    let destructThreshold = 0;
    let destroyRoads = false;
    if (flags) {
      destructThreshold = flags.destructThreshold || 0;
      destroyRoads = flags.destroyRoads || false;
      constructThreshold = flags.constructThreshold || BUILD_STEP_THRESHOLD;
      if (constructThreshold < BUILD_STEP_THRESHOLD) {
        constructThreshold = BUILD_STEP_THRESHOLD;
      }
      if (destructThreshold >= constructThreshold) {
        destructThreshold = constructThreshold - 1;
      }
    }
    console.log(`destructThreshold=${destructThreshold}, constructThreshold=${constructThreshold}`);
    const roadPositions =
      generateRoadPositions(this, constructThreshold, destructThreshold);
    console.log(`${roadPositions.new.length} roads to construct, ${roadPositions.obsolete.length} roads to destroy`);
    constructRoads(this.city.room, roadPositions.new);
    deconstructRoads(this.city.room, roadPositions.obsolete, destroyRoads);
  }

  run() {
    const dt = Game.time - this.startTime;
    if (dt > TIME_NEW_ROAD_REPORT) {
      this.applyRoadPositions();
      resetMovementGrid(this);
    }
  }
};

module.exports = CivilEngineer;
