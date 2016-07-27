/**
 * A City representation of the room.
 */

const u = require('./utils');


/**
 * Monkey patch some screeps classes...
 */
Structure.prototype.needsRepair = function needsRepair() {
  return this.hits < this.hitsMax;
};


const City = class City {

  constructor(room) {
    this.room = room;

    // Get all the information about the room
    this.controller = room.controller;
    this.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    this.spawners = room.find(FIND_MY_SPAWNS);
    this.citizens = room.find(FIND_MY_CREEPS);
    this.enemies = room.find(FIND_HOSTILE_CREEPS);
    this.structures = room.find(FIND_STRUCTURES);
    this.sources = room.find(FIND_SOURCES);
    this.minerals = room.find(FIND_MINERALS);
    this.harvestSites = this.minerals.filter((m) =>
      m.pos.lookFor(LOOK_STRUCTURES).length > 0).join(this.sources);

    // Determine the number of various structures.
    let numRoads = 0;
    let numRamparts = 0;
    let numTowers = 0;
    let numWalls = 0;
    let numRepairableSites = 0;
    let numEnergyStorage = 0;
    let numMineralStorage = 0;
    const numStructures = this.structures.length;
    for (let i = 0; i < numStructures; ++i) {
      const s = this.structures[i];
      if (s.needsRepair()) {
        ++numRepairableSites;
      }
      switch (s.structureType) {
        case STRUCTURE_ROAD: ++numRoads; break;
        case STRUCTURE_RAMPART: ++numRamparts; break;
        case STRUCTURE_WALL: ++numWalls; break;
        case STRUCTURE_TOWER: ++numTowers; ++numEnergyStorage; break;
        case STRUCTURE_STORAGE: ++numEnergyStorage; ++numMineralStorage; break;
        case STRUCTURE_CONTAINER: ++numEnergyStorage; ++numMineralStorage; break;
        case STRUCTURE_LAB: ++numEnergyStorage; ++numMineralStorage; break;
        case STRUCTURE_EXTENSION: ++numEnergyStorage; break;
        case STRUCTURE_SPAWN: ++numEnergyStorage; break;
        case STRUCTURE_LINK: ++numEnergyStorage; break;

        default: break;
      }
    }

    // Populate the array
    this.roads = new Array(numRoads);
    this.ramparts = new Array(numRamparts);
    this.walls = new Array(numWalls);
    this.towers = new Array(numTowers);
    this.repairableSites = new Array(numRepairableSites);
    this.energyStorage = new Array(numEnergyStorage);
    this.mineralStorage = new Array(numMineralStorage);
    for (let i = 0; i < numStructures; ++i) {
      const s = this.structures[i];
      if (s.needsRepair()) {
        this.repairableSites[--numRepairableSites] = s;
      }
      switch (s.structureType) {
        case STRUCTURE_ROAD:
          this.roads[--numRoads] = s;
          break;
        case STRUCTURE_RAMPART:
          this.ramparts[--numRamparts] = s;
          break;
        case STRUCTURE_WALL:
          this.walls[--numWalls] = s;
          break;
        case STRUCTURE_TOWER:
          this.towers[--numTowers] = s;
          this.energyStorage[--numEnergyStorage] = s;
          break;
        case STRUCTURE_STORAGE:
          this.energyStorage[--numEnergyStorage] = s;
          this.mineralStorage[--numMineralStorage] = s;
          break;
        case STRUCTURE_CONTAINER:
          this.energyStorage[--numEnergyStorage] = s;
          this.mineralStorage[--numMineralStorage] = s;
          break;
        case STRUCTURE_LAB:
          this.energyStorage[--numEnergyStorage] = s;
          this.mineralStorage[--numMineralStorage] = s;
          break;
        case STRUCTURE_EXTENSION:
          this.energyStorage[--numEnergyStorage] = s;
          break;
        case STRUCTURE_SPAWN:
          this.energyStorage[--numEnergyStorage] = s;
          break;
        case STRUCTURE_LINK:
          this.energyStorage[--numEnergyStorage] = s;
          break;
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
