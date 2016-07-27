/**
 * A City representation of the room.
 */
const Boss = require('boss');

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

    // Search for all citizens of the city - they may even be in other rooms!
    this.citizens = room.find(FIND_MY_CREEPS, { filter: (c) => !c.memory.city });
    this.citizens.forEach((c) => { c.memory.city = room.name; });
    this.citizens.concat(Object.keys(Game.creeps)
      .filter((k) => Memory.creeps[k].city === room.name)
      .map((k) => Game.creeps[k]));

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

    this.boss = new Boss(this);
  }
  
  needsHelp() {
      return false;
  }
};


module.exports = City;
