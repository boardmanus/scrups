/*
 * Dismantler logic
 */
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
    return f.color === COLOR_BLUE;
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
      const flaggedStructures = room.lookForAt(LOOK_STRUCTURES, flag.pos);
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
      console.log(`worker-${worker.name} is carrying too much energy`);
      return Dismantler.ERROR.FULL_ENERGY;
    }

    console.log(`worker-${worker.name} is carrying ${_.sum(worker.carry)}/${worker.carryCapacity}`);

    if (!site && !worker.memory.site) {
      const sites = Dismantler.find_sites(worker.room);
      if (sites.length === 0) {
        console.log(`worker-${worker.name} found no sites to dismantle...`);
        return Dismantler.ERROR.NO_SITES_TO_DISMANTLE;
      }
      site = sites[worker.ticksToLive % sites.length];
      console.log(`worker-${worker.name} about to dismantle ${site.structureType}-${site.id}`);
      worker.memory.site = site.id;
    } else if (!worker.memory.site) {
      worker.memory.site = site.id;
    } else {
      site = Game.getObjectById(worker.memory.site);
      if (site == null) {
        console.log(`worker-${worker.name} site-${worker.memory.site} invalid!  Removing...`);
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
        if (res === ERR_NO_PATH) {
          console.log(`worker-${worker.name} failed moving to ${site.structureType}-${site.id} (${res})`);
          return Dismantler.ERROR.FAILED_TO_DISMANTLE;
        }
        break;
      default:
        console.log(`worker-${worker.name} failed to dismantle ${site.structureType}-${site.id} (${res}`);
        return Dismantler.ERROR.FAILED_TO_DISMANTLE;
    }

    worker.memory.operation = Dismantler.OPERATION;
    return Dismantler.ERROR.NONE;
  },
};

module.exports = Dismantler;
