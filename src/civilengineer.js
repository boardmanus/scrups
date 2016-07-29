/*
 * A civil engineer that takes care of roading and infrastructure issues
 */
const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';
const BUILD_STEP_THRESHOLD = 20;
const TIME_NEW_ROAD_REPORT = 10000;


function movementCostAt(room, x, y) {
  const t = room.lookForAt(LOOK_TERRAIN, x, y)[0];

  if (t == TERRAIN_PLAIN) {
      return 1;
  } else if (t == TERRAIN_SWAMP) {
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
      row[x] = { steps: 0, totalSteps: 0, cost: cost };
    }
  }
  return grid;
}


function generateRoadPositions(eng) {
  const roads = { new: [], obsolete: [] };
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      const info = eng.movementGrid[y][x];
      const road = eng.city.room.lookForAt(LOOK_STRUCTURES, x, y).find((s) => s.structureType === STRUCTURE_ROAD);
      if (!road && info.steps > BUILD_STEP_THRESHOLD) {
        roads.new.push({ x, y });
      } else if (road && info.steps === 0) {
         roads.obsolete.push({x, y});
      }
    }
  }

  return roads;
}


function constructRoads(room, locations) {
  locations.forEach((pos) => {
    const res = room.createConstructionSite(pos.x, pos.y);
    if (res !== 0) {
      console.log(`Failed to construct road @ (${pos.x}, ${pos.y}) - err=${res}`);
    }
  });
}


function deconstructRoads(room, locations) {
  locations.forEach((pos) => {
    const res = room.createFlag(pos.x, pos.y, `Dismantle-${pos.x}x${pos.y}-Road`);
    if (res !== 0) {
      console.log(`Failed to mark road destruction @ (${pos.x}, ${pos.y}) - err=${res}`);
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


function roadReport(pos, total = false) {
    const steps = (total? pos.totalSteps : pos.steps);
  if (pos.steps > 10) {
    return 'x';
  } else if (pos.steps > 5) {
    return 'o';
  } else if (pos.steps > 0) {
    return '-';
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
    const gridPos = this.movementGrid[creep.pos.x][creep.pos.y];
    gridPos.steps += gridPos.cost;
    gridPos.totalSteps += gridPos.cost;
    return gridPos.steps;
  }

  roadingReport(total = false) {
    for (let y = 0; y < ROOM_HEIGHT; ++y) {
      let row = '';
      for (let x = 0; x < ROOM_WIDTH; ++x) {
        row += roadReport(this.movementGrid[y][x], total);
      }
      console.log(row);
    }
  }

  run() {
    const dt = Game.time - this.startTime;
    if (dt > TIME_NEW_ROAD_REPORT) {
      const roadPositions = generateRoadPositions(this);
      resetMovementGrid(this);
      constructRoads(this.city.room, roadPositions.new);
      deconstructRoads(this.city.room, roadPositions.obsolete);
    }
  }
};

module.exports = CivilEngineer;
