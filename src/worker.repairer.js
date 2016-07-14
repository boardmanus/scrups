/*
 * Repairer logic
 */
const u = require('utils');
const Dismantler = require('worker.dismantler');

const Repairer = {

  OPERATION: 'repairing',


  ERROR: {
    NONE: 0,
    NO_ENERGY: -1,
    IS_SPAWNING: -2,
    NO_REPAIR_SITES: -3,
    REPAIR_FAILED: -4,
  },


    /**
     * Determines whether a structure should be repaired
     * @param structure the structure to check
     * @return true if the structure should be repaired
     */
  should_repair(structure) {
    let repair = false;
    switch (structure.structureType) {
      case STRUCTURE_STORAGE:
      case STRUCTURE_EXTENSION:
      case STRUCTURE_SPAWN:
        repair = structure.hits < structure.hitsMax;
        break;
      case STRUCTURE_CONTAINER:
        repair = structure.hits < 2 * structure.hitsMax / 3;
        break;
      case STRUCTURE_RAMPART:
        repair = structure.hits < structure.hitsMax / 10;
        break;
      case STRUCTURE_ROAD:
        repair = structure.hits < structure.hitsMax / 3;
        break;
      case STRUCTURE_WALL:
        repair = structure.hits < 20000;
        break;
      default:
        break;
    }

    if (repair) {
      repair = !Dismantler.has_structures_to_dismantle(structure.room, structure.pos);
      if (!repair) {
        console.log(`Won\'t repair ${u.name(structure)} as it is flagged for deconstruction`);
      }
    }

    return repair;
  },


    /**
     * Indicates whether a structure needs repairing of some kind.
     * @param structure the structure to check
     */
  needs_repairing(structure) {
    return structure.hits < structure.hitsMax;
  },


    /**
     * Defines the order in which repairs should be taken
     * @param structure the structure to generate a weighting for
     * @return the wieghting for a repair of this structure
     */
  repair_weighting(pos, structure) {
    const damageRatio = structure.hits / structure.hitsMax;
    const distance = pos.getRangeTo(structure);
    switch (structure.structureType) {
      case STRUCTURE_SPAWN: {
        return 0;
      }
      case STRUCTURE_STORAGE:
      case STRUCTURE_EXTENSION: {
        return 1000 + damageRatio * 500 + distance;
      }
      case STRUCTURE_ROAD:
        return (((structure.hits < structure.hitsMax / 5) ? 2000 : 4000) +
                  damageRatio * 500 + distance);
      case STRUCTURE_WALL:
        if (structure.hits < 1000) {
          return distance + 3000 + structure.hits / 1000 * 500;
        } else if (structure.hits < 10000) {
          return distance + 5000 + structure.hits / 10000 * 500;
        } else if (structure.hits < 20000) {
          return distance + 7000 + structure.hits / 20000 * 500;
        }
        break;
      case STRUCTURE_RAMPART:
        if (structure.hits < structure.hitsMax / 50) {
          return distance + 5000 + structure.hits / (structure.hitsMax / 50) * 500;
        } else if (structure.hits < structure.hitsMax / 15) {
          return distance + 5000 + structure.hits / (structure.hitsMax / 15) * 500;
        } else if (structure.hits < structure.hitsMax / 10) {
          return distance + 7000 + structure.hits / (structure.hitsMax / 10) * 500;
        }
        break;
      case STRUCTURE_CONTAINER:
        if (structure.hits < structure.hitsMax / 50) {
          return 2000 + damageRatio * 500;
        } else if (structure.hits < structure.hitsMax / 10) {
          return 4000 + damageRatio * 500;
        } else if (structure.hits < structure.hitsMax / 5) {
          return 6000 + damageRatio * 500;
        }
        break;
      default:
        break;
    }
    return 1000000 + distance;
  },


    /**
     * Finds the construction sites in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of construction sites
     */
  find_sites(worker) {
    const sites = worker.room.find(FIND_MY_STRUCTURES, {
      filter: Repairer.should_repair,
    });
    return _.sortBy(sites, Repairer.repair_weighting);
  },


    /**
     * Start/Continue the worker building at the site.
     * @param worker the worker to order around
     * @param site the site to build at.
     * @return the result of the operation
     */
  work(worker, workSite = null) {
    if (worker.spawning) {
      console.log(`${u.name(worker)} is spawning...`);
      return Repairer.ERROR.IS_SPAWNING;
    }

    let site = workSite;
    if (_.sum(worker.carry) === 0) {
      console.log(`${u.name(worker)} has no energy to repair with...`);
      return Repairer.ERROR.NO_ENERGY;
    }

    if (!site && !worker.memory.site) {
      const sites = Repairer.find_sites(worker);
      if (sites.length === 0) {
        console.log(`${u.name(worker)} found no structures to repair...`);
        return Repairer.ERROR.NO_REPAIR_SITES;
      }
      site = sites[0];
      console.log(`${u.name(worker)} will repair ${u.name(site)}`);
      worker.memory.site = site.id;
    } else if (!worker.memory.site) {
      worker.memory.site = site.id;
    } else {
      site = Game.getObjectById(worker.memory.site);
    }

    if (site == null) {
      console.log(`${u.name(worker)} has no site to repair...`);
      return Repairer.ERROR.REPAIR_FAILED;
    }

    const e = _.sum(worker.carry);
    const h = site.hits;
    let res = worker.repair(site);
    switch (res) {
      case 0:
        console.log(`${u.name(worker)} repairing ${u.name(site)} (energy=${e}=>${_.sum(worker.carry)}, hits=${h}=>${site.hits}/${site.hitsMax})`);
        if (e === _.sum(worker.carry) && h === site.hits) {
          console.log(`${u.name(worker)} didn't appear to repair ${u.name(site)}...`);
          return Repairer.ERROR.REPAIR_FAILED;
        }
        break;
      case ERR_NOT_IN_RANGE:
        res = worker.moveTo(site);
        if (res !== 0) {
          console.log(`${u.name(worker)} couldn't move to repair site (${res})`);
          return Repairer.ERROR.REPAIR_FAILED;
        }
        break;
      default:
        console.log(`${u.name(worker)}  failed to repair ${u.name(site)} (${res})`);
        return Repairer.ERROR.REPAIR_FAILED;
    }

    worker.memory.operation = Repairer.OPERATION;
    return Repairer.ERROR.NONE;
  },
};

module.exports = Repairer;
