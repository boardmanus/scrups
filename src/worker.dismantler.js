/*
 * Dismantler logic
 */
const u = require('utils');

const Dismantler = {


  OPERATION: 'dismantling',


  ERROR: {
    NONE: 0,
    NO_SITES_TO_DISMANTLE: -1,
    FAILED_TO_DISMANTLE: -2,
    FULL_ENERGY: -3,
    IS_SPAWNING: -4,
  },


  /**
   * Determines if a flag is a dismantler
   * @param flag the flag to check
   * @return true if a dismantler flag
   */
  is_dismantler_flag(f) {
    return /^Dismantle/.test(f.name);
  },


  /**
   * Determines whether the position in the room has a dismantler flag.
   * @param room the room to check
   * @param the position in the room
   * @return true if the re are structures to be dismantled.
   */
  has_structures_to_dismantle(room, pos) {
    const flags = room.lookForAt(LOOK_FLAGS, pos);
    return (_.filter(flags, Dismantler.is_dismantler_flag).length !== 0);
  },

  shouldDismantle(structure) {
    const flags = structure.pos.lookFor(LOOK_FLAGS).filter(
      Dismantler.is_dismantler_flag);

    return flags.find((f) => {
      const type = flag.name.replace(/^Dismantle(-.+-)?(.*)$/, '$2');
      return (type === '' || type === 'all' || type === structure.structureType);
    });
  },

  /**
   * Finds  sites in the room, and orders them by priority.
   * @param room the room to search
   * @return an ordered array of construction sites
   */
  find_sites(room) {
    const flags = room.find(FIND_FLAGS, { filter: Dismantler.is_dismantler_flag });
    console.log(`Found ${flags.length} dismantler flags.`);
    let structures = [];
    flags.forEach((flag) => {
      const type = flag.name.replace(/^Dismantle(-.+-)?(.*)$/, '$2');
      let flaggedStructures = room.lookForAt(LOOK_STRUCTURES, flag.pos);
      if (type !== '' && type !== 'all') {
        flaggedStructures = flaggedStructures.filter((s) => s.structureType === type);
      }
      if (flaggedStructures.length === 0) {
        console.log('Found dismantle flag - but no structures');
        flag.remove();
      } else {
        console.log(`Adding ${flaggedStructures.length} structures for dismantling.`);
        structures = structures.concat(flaggedStructures);
      }
    });

    return structures;
  },


  /**
   * Start/Continue the worker dismantling a site.
   * @param worker the worker to order around
   * @return the result of the operation
   */
  work(worker, workSite = null) {
    let site = workSite;

    if (worker.spawning) {
      return Dismantler.ERROR.IS_SPAWNING;
    }

    if (_.sum(worker.carry) > 2 * worker.carryCapacity / 3) {
      console.log(`${u.name(worker)} is carrying too much energy`);
      return Dismantler.ERROR.FULL_ENERGY;
    }

    console.log(`${u.name(worker)} is carrying ${_.sum(worker.carry)}/${worker.carryCapacity}`);

    if (!site && !worker.memory.site) {
      const sites = Dismantler.find_sites(worker.city.room);
      if (sites.length === 0) {
        console.log(`${u.name(worker)} found no sites to dismantle...`);
        return Dismantler.ERROR.NO_SITES_TO_DISMANTLE;
      }
      site = sites[worker.ticksToLive % sites.length];
      console.log(`${u.name(worker)} about to dismantle ${u.name(site)}`);
      worker.memory.site = site.id;
    } else if (!worker.memory.site) {
      worker.memory.site = site.id;
    } else {
      site = Game.getObjectById(worker.memory.site);
      if (site == null) {
        console.log(`${u.name(worker)} site-${worker.memory.site} invalid!  Removing...`);
        worker.memory.site = null;
        return Dismantler.ERROR.NO_SITES_TO_DISMANTLE;
      }
    }

    let res = worker.dismantle(site);
    switch (res) {
      case 0:
        break;
      case ERR_NOT_IN_RANGE:
        res = worker.moveTo(site);
        if (res === 0) {
          worker.room.city.civilEngineer.registerMovement(worker);
        } else if (res === ERR_NO_PATH) {
          console.log(`${u.name(worker)} failed moving to ${u.name(site)} (${res})`);
          return Dismantler.ERROR.FAILED_TO_DISMANTLE;
        }
        break;
      default:
        console.log(`${u.name(worker)} failed to dismantle ${u.name(site)} (${res}`);
        return Dismantler.ERROR.FAILED_TO_DISMANTLE;
    }

    worker.memory.operation = Dismantler.OPERATION;
    return Dismantler.ERROR.NONE;
  },
};

module.exports = Dismantler;
