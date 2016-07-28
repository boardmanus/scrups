/*
 * A civil engineer that takes care of roading and infrastructure issues
 */
const ROOM_HEIGHT = 50;
const ROOM_WIDTH = 50;
const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';
const BUILD_STEP_THRESHOLD = 20;
const TIME_NEW_ROAD_REPORT = 100;


function movementCostAt(room, x, y) {
  const t = room.lookForAt(LOOK_TERRAIN, x, y);

  switch (t) {
    case TERRAIN_PLAIN: return 1;
    case TERRAIN_SWAMP: return 3;
    default: break;
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
  const grid = new Array(ROOM_HEIGHT);
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    const row = new Array(ROOM_WIDTH);
    grid[y] = row;
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      row[x] = { steps: 0, totalSteps: 0, cost: movementCostAt(room, x, y) };
    }
  }
  return grid;
}


function generateNewRoadPositions(eng) {
  const newRoads = [];
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      const info = eng.movementGrid[y][x];
      if (info.steps > BUILD_STEP_THRESHOLD) {
        newRoads.push({ x, y });
      }
    }
  }

  return newRoads;
}


function constructRoads(room, locations) {
  locations.forEach((pos) => {
    const res = room.createConstructionSite(pos.x, pos.y);
    if (res !== 0) {
      console.log(`Failed to construct road @ (${pos.x}, ${pos.y}) - err=${res}`);
    }
  });
}


function resetMovementGrid(eng) {
  for (let y = 0; y < ROOM_HEIGHT; ++y) {
    for (let x = 0; x < ROOM_WIDTH; ++x) {
      eng.movementGrid[y][x].steps = 0;
    }
  }
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


  run() {
    const dt = Game.time - this.startTime;
    if (dt > TIME_NEW_ROAD_REPORT) {
      const newRoadPositions = generateNewRoadPositions(this);
      resetMovementGrid(this);
      constructRoads(newRoadPositions);
    }
  }
};

module.exports = CivilEngineer;
