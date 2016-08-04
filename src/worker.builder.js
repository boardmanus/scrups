/*
 * Builder logic
 */
const u = require('utils');

const Builder = {


  OPERATION: 'building',


  ERROR: {
    NONE: 0,
    NO_ENERGY: -1,
    IS_SPAWNING: -2,
    NO_CONSTRUCTION_SITES: -3,
    BUILD_FAILED: -4,
  },


    /**
     * Finds the construction sites in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of construction sites
     */
  find_sites(room) {
    const rooms = room.find(FIND_MY_CONSTRUCTION_SITES);
    Game.country.spawnSites.forEach((ss) => rooms.push(ss));
    return _.sortBy(rooms, (s) => {
      switch (s.structureType) {
        case STRUCTURE_WALL: return 10;
        case STRUCTURE_TOWER: return 11;
        case STRUCTURE_SPAWN: return 20;
        case STRUCTURE_EXTENSION: return 21;
        case STRUCTURE_RAMPART: return 9;
        case STRUCTURE_STORAGE: return 25;
        case STRUCTURE_LAB: return 26;
        case STRUCTURE_ROAD: return 30;
        default: break;
      }
      return 100;
    });
  },


  /**
   * Start/Continue the worker building at the site.
   * @param worker the worker to order around
   * @param site the site to build at.  If null, use workers current or best option
   * @return the result of the operation
   */
  work(worker, workSite = null) {
    if (worker.spawning) {
      return Builder.ERROR.IS_SPAWNING;
    }

    let site = workSite;
    if (_.sum(worker.carry) === 0) {
      console.log(`worker-${worker.name} has no energy to build with`);
      return Builder.ERROR.NO_ENERGY;
    }

    if (site == null && worker.memory.site == null) {
      const sites = Builder.find_sites(worker.workRoom());
      if (sites.length === 0) {
        console.log(`${u.name(worker)} found no construction sites to build on...`);
        return Builder.ERROR.NO_CONSTRUCTION_SITES;
      }
      site = sites[0];
      console.log(`${u.name(worker)} about to build at ${u.name(site)}`);
      worker.memory.site = site.id;
    } else if (worker.memory.site === null) {
      worker.memory.site = site.id;
    } else {
      site = Game.getObjectById(worker.memory.site);
      if (!site) {
        console.log(`${u.name(worker)} worker site invalid!  Removing...`);
        worker.memory.site = null;
        return Builder.ERROR.NO_CONSTRUCTION_SITES;
      }
    }

    const res = worker.build(site);
    switch (res) {
      case 0:
        break;
      case ERR_NOT_IN_RANGE:
        worker.moveTo(site);
        break;
      default:
        console.log(`${u.name(worker)} failed to build on ${u.name(site)} (${res})`);
        return Builder.ERROR.BUILD_FAILED;
    }

    worker.memory.operation = Builder.OPERATION;
    return Builder.ERROR.NONE;
  },
};

module.exports = Builder;
