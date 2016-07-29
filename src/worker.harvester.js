/*
 * Harvester logic
 */
const u = require('utils');

const Harvester = {


  OPERATION: 'harvesting',


  ERROR: {
    NONE: 0,
    NO_ENERGY: -1,
    IS_SPAWNING: -2,
    NO_SOURCES: -3,
    HARVESTING_FAILED: -4,
    FAILED_TO_MOVE: -5,
    FULL: -6,
  },


  /**
   * Finds the sources in the room, and orders them by priority.
   * @param room the room to search
   * @return an ordered array of energy sources
   */
  find_sources(room, worker = null) {
    let sources = room.city.sources;
    if (room.storage) {
      sources.push(room.storage);
    }
    sources = sources.concat(room.find(FIND_DROPPED_ENERGY))
                     .concat(room.find(FIND_STRUCTURES, {
                       filter: (s) => s.structureType === STRUCTURE_CONTAINER }));

    sources = _.sortBy(sources, (s) => {
      let energyRatio = 1.0;
      if (s instanceof Structure) {
        energyRatio = s.store[RESOURCE_ENERGY] / s.storeCapacity * 0.25;
      } else if (s instanceof Resource) {
        console.log(`Energy to pickup ${u.name(s)}!`);
        energyRatio = 10.0;
      } else {
        energyRatio = s.energy / s.energyCapacity;
      }
      let distance = 10;
      if (worker) {
        distance = worker.pos.getRangeTo(s);
      }
      return distance / energyRatio;
    });

    return sources;
  },


/**
 * Start/Continue the worker harvesting at the source.
 * @param worker the worker to order around
* @param source the source to harvest from.
 * @return the result of the operation
 */
  work(worker, workSite = null) {
    if (worker.spawning) {
      return Harvester.ERROR.IS_SPAWNING;
    }

    let source = workSite;
    if (_.sum(worker.carry) === worker.carryCapacity) {
      console.log(`${u.name(worker)} already has maximum energy!`);
      return Harvester.ERROR.NO_ENERGY;
    }

    if (source == null && worker.memory.site == null) {
      const sources = Harvester.find_sources(worker.room, worker);
      if (sources.length === 0) {
        console.log(`${u.name(worker)} found no sources to harvest...`);
        return Harvester.ERROR.NO_SOURCES;
      }

      source = sources[0];
      console.log(`${u.name(worker)} is about to harvest from ${u.name(source)}`);
      worker.memory.site = source.id;
    } else if (worker.memory.site == null) {
      worker.memory.site = source.id;
    } else {
      source = Game.getObjectById(worker.memory.site);
    }

    let res = 0;
    if (source instanceof Structure) {
      console.log(`${u.name(worker)} nicking energy from storage`);
      res = worker.withdraw(
        source,
        RESOURCE_ENERGY,
        worker.carryCapacity - _.sum(worker.carry));
    } else if (source instanceof Resource) {
      console.log(`${u.name(worker)} is picking up some energy!`);
      res = worker.pickup(source);
    } else {
      res = worker.harvest(source);
    }

    switch (res) {
      case 0:
        if (_.sum(worker.carry) >= worker.carryCapacity) {
          console.log(`${u.name(worker)} is full after harvesting`);
          return Harvester.ERROR.FULL;
        }
        break;
      case ERR_NOT_IN_RANGE: {
        res = worker.moveTo(source);
        if (res === 0) {
          worker.room.city.civilEngineer.registerMovement(worker);
        } else if (res !== 0) {
          console.log(`${u.name(worker)} failed to move! (${res})`);
          return Harvester.ERROR.FAILED_TO_MOVE;
        }

        break;
      }
      default:
        console.log(`${u.name(worker)} failed to harvest from ${u.name(source)} (${res})`);
        return Harvester.ERROR.HARVESTING_FAILED;
    }

    worker.memory.operation = Harvester.OPERATION;
    return Harvester.ERROR.NONE;
  },
};

module.exports = Harvester;
