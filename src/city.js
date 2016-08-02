/**
 * A City representation of the room.
 */
const u = require('utils');
const Boss = require('boss');
const CivilEngineer = require('civilengineer');

/**
 * Monkey patch some screeps classes...
 */
Structure.prototype.needsRepair = function needsRepair() {
  return this.hits < this.hitsMax;
};


const City = class City {

  constructor(room) {
    this.room = room;
    room.city = this;

     // Get all the information about the room
    this.controller = room.controller;
    this.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    this.spawners = room.find(FIND_MY_SPAWNS);

     // Search for all citizens of the city - they may even be in other rooms!
    this.citizens = room.find(FIND_MY_CREEPS, { filter: (c) => !c.memory.city });
    this.citizens.forEach((c) => { c.memory.city = room.name; });
    this.citizens = this.citizens.concat(Object.keys(Game.creeps)
      .filter((k) => Game.creeps[k].memory.city === room.name)
      .map((k) => Game.creeps[k]));
    this.citizens.forEach((c) => {
      c.city = this;
      if (c.city.room !== c.room) {
        console.log(`${u.name(c)} is in the wrong room (city=${c.city.room.name}, room=${c.room.name})`);
      }
    });

    this.enemies = room.find(FIND_HOSTILE_CREEPS);
    this.structures = room.find(FIND_STRUCTURES);
    this.sources = room.find(FIND_SOURCES);
    this.minerals = room.find(FIND_MINERALS);
    this.harvestSites = this.minerals.filter((m) =>
      m.pos.lookFor(LOOK_STRUCTURES).length > 0).join(this.sources);
    this.resources = room.find(FIND_DROPPED_ENERGY);

    // Determine the number of various structures.
    let numRoads = 0;
    let numRamparts = 0;
    let numTowers = 0;
    let numWalls = 0;
    let numRepairableSites = 0;
    let numEnergyStorage = 0;
    let numMineralStorage = 0;
    let numEnergyCollection = 0;
    const numStructures = this.structures.length;
    for (let i = 0; i < numStructures; ++i) {
      const s = this.structures[i];
      if (s.needsRepair()) {
        ++numRepairableSites;
      }
      switch (s.structureType) {
        case STRUCTURE_ROAD:
          ++numRoads;
          break;
        case STRUCTURE_RAMPART:
          ++numRamparts;
          break;
        case STRUCTURE_WALL:
          ++numWalls;
          break;
        case STRUCTURE_TOWER:
          ++numTowers;
          ++numEnergyStorage;
          break;
        case STRUCTURE_CONTAINER:
        case STRUCTURE_STORAGE:
          ++numEnergyStorage;
          ++numMineralStorage;
          ++numEnergyCollection;
          break;
        case STRUCTURE_LAB:
          ++numEnergyStorage;
          ++numMineralStorage;
          break;
        case STRUCTURE_LINK:
        case STRUCTURE_SPAWN:
        case STRUCTURE_EXTENSION:
          ++numEnergyStorage;
          ++numEnergyCollection;
          break;

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
    this.energyCollection = new Array(numEnergyCollection);
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
          this.energyCollection[--numEnergyCollection] = s;
          break;
        case STRUCTURE_CONTAINER:
          this.energyStorage[--numEnergyStorage] = s;
          this.mineralStorage[--numMineralStorage] = s;
          this.energyCollection[--numEnergyCollection] = s;
          break;
        case STRUCTURE_LAB:
          this.energyStorage[--numEnergyStorage] = s;
          this.mineralStorage[--numMineralStorage] = s;
          break;
        case STRUCTURE_EXTENSION:
          this.energyStorage[--numEnergyStorage] = s;
          this.energyCollection[--numEnergyCollection] = s;
          break;
        case STRUCTURE_SPAWN:
          this.energyStorage[--numEnergyStorage] = s;
          this.energyCollection[--numEnergyCollection] = s;
          break;
        case STRUCTURE_LINK:
          this.energyStorage[--numEnergyStorage] = s;
          this.energyCollection[--numEnergyCollection] = s;
          break;
        default:
          break;
      }
    }

    this.boss = new Boss(this);
    this.civilEngineer = new CivilEngineer(this);
  }

  needsHelp() {
    return ((this.citizens === 0) ||
              ((this.spawners.length === 0) && (this.citizens.length < 5)));
  }


  /**
   * Relocate a creep to this city.
   * @param creep the creep to Relocate
   */
  relocate(creep) {
    if (creep.memory.city !== this.room.name) {
      creep.memory.city = this.room.name;
      this.citizens.push(creep);
    }
  }

  run() {
    this.civilEngineer.run();
    this.boss.run();
  }
};


/**
 * Monkey patch the base game classes to provide easier access to important
 * functionality.
 */

City.monkeyPatch = function monkeyPatch() {
  CivilEngineer.monkeyPatch();
  Boss.monkeyPatch();
};


module.exports = City;
