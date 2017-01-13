const u = require('utils');

/**
 * Manages the spawners to create creeps as needed
 */
class Cloner {

  /**
   * Creates a new cloner for the room.
   * @param {Room} room room the cloner belongs to
   */
  constructor(room) {
    if (!room) {
      throw new RangeError(`Room for cloner cannot be undefined/null`);
    }
    if (!(room instanceof Room)) {
      throw new TypeError('room must be a Room');
    }

    if (room.cloner) {
      // The cloner of the room should not have been set yet!
      // We only allow one cloner per room.
      throw new Error(`${room.info()} already has a boss (${this.info()})`);
    }

    // The room must have at least one spawner for a cloner to operate
    this.spawners = room.find(FIND_MY_SPAWNS);
    if (this.spawners.length === 0) {
      throw new Error(`${room.info()} has no spawners!`);
    }

    this.room = room;
    this.cache = new u.Cache();
    this.cloneQueue = [];

    room.cloner = this;
  }

  grow() {
    if (this.cloneQueue.length === 0) {
      return;
    }

    let body = 0;
    for (let i = 0; i < this.spawners.length && body < this.cloneQueue.length; ++i) {
      const spawner = this.spawners[i];
      if (!spawner.spawning) {
        spawner.createCreep(this.cloneQueue[body++]);
      }
    }
  }
}


module.exports = Cloner;
