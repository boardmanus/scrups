/*
 * Defender logic
 */
const u = require('utils');

const Defender = {


  OPERATION: 'defending',


  ERROR: {
    NONE: 0,
    NO_ENERGY: -1,
    IS_SPAWNING: -2,
    NO_SOURCES: -3,
    HARVESTING_FAILED: -4,
  },


    /**
     * Finds the sources in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of energy sources
     */
  find_civilians(room) {
    console.log(`find_civilians(${u.name(room)}) - not implemented!`);
    return null;
  },


    /**
     * Start/Continue the worker harvesting at the source.
     * @param worker the worker to order around
     * @param source the source to harvest from.
     * @return the result of the operation
     */
  work(soldier) {
    let target = null;
    if (soldier.memory.target == null) {
      const targets = _.sortBy(soldier.room.find(FIND_HOSTILE_CREEPS), (t) =>
        soldier.pos.getRangeTo(t)
      );
      if (targets.length > 0) {
        target = targets[0];
        soldier.memory.target = target.id;
      }
    } else {
      target = Game.getObjectById(soldier.memory.target);
    }

    if (!target) {
      return Defender.ERROR.NONE;
    }

    const res = soldier.attack(target);
    switch (res) {
      case 0:
        break;
      case ERR_NOT_IN_RANGE:
        soldier.moveTo(target);
        break;
      default:
        soldier.memory.target = null;
        break;
    }

    return Defender.ERROR.NONE;
  },
};

module.exports = Defender;
