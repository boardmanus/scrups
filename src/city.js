/**
 * A City representation of the room.
 */

const u = require('./utils');

const City = class City {

  constructor(room) {
    this.room = room;
    this.controller = room.controller;
    this.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    this.spawners = room.find(FIND_MY_SPAWNS);
    this.citizens = room.find(FIND_MY_CREEPS);
    this.enemies = room.find(FIND_HOSTILE_CREEPS);
    this.structures = room.find(FIND_STRUCTURES);
    this.sources = room.find(FIND_SOURCES);
    this.minerals = room.find(FIND_MINERALS);
    this.harvestableMinerals = _.filter(this.minerals, (m) =>
      m.pos.lookFor(LOOK_STRUCTURES).length > 0
    );

    // Determine the number of various structures.
    let numRoads = 0;
    let numRamparts = 0;
    let numTowers = 0;
    let numWalls = 0;
    const numStructures = this.structures.length;
    for (let i = 0; i < numStructures; ++i) {
      switch (this.structures[i].structureType) {
        case STRUCTURE_ROAD: ++numRoads; break;
        case STRUCTURE_RAMPART: ++numRamparts; break;
        case STRUCTURE_WALL: ++numWalls; break;
        case STRUCTURE_TOWER: ++numTowers; break;
        default: break;
      }
    }

    // Populate the array
    this.roads = new Array(numRoads);
    this.ramparts = new Array(numRamparts);
    this.walls = new Array(numWalls);
    this.towers = new Array(numTowers);
    for (let i = 0; i < numStructures; ++i) {
      const s = this.structures[i];
      switch (s.structureType) {
        case STRUCTURE_ROAD: this.roads[--numRoads] = s; break;
        case STRUCTURE_RAMPART: this.ramparts[--numRamparts] = s; break;
        case STRUCTURE_WALL: this.walls[--numWalls] = s; break;
        case STRUCTURE_TOWER: this.towers[--numTowers] = s; break;
        default: break;
      }
    }
  }

  needsHelp() {
    return this.controller.my && (this.spawners.length === 0);
  }

  /**
   * Generate information about the site
   */
  info() {
    return `site-${this.type}-${u.name(this.site)}`;
  }

 /**
  * Determines the priority of the job with respect to the game state.
  */
  workOrders() {
    return [];
  }
};


module.exports = City;
