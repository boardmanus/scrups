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
  work(worker) {
    console.log(`${u.name(worker)} - not implemented!`);
    return Defender.ERROR.NONE;
  },
};

module.exports = Defender;
