/**
 * Provides some basic utilities for logging and such
 */

module.exports = {
  /**
   * Creates a good name for a screeps objects
   * @param {RoomObj} obj the screep object to generate a name for
   * @return {string} name for the object
   */
  name(obj) {
    if (obj instanceof Structure) {
      return `${obj.structureType}-${obj.id}`;
    } else if (obj instanceof Creep) {
      return ((obj.my) ?
        `${obj.memory.role}-${obj.name}` :
        `enemy-${obj.owner}-${obj.name}`);
    } else if (obj instanceof Room) {
      return `room-${obj.name}`;
    } else if (obj instanceof Source) {
      return `source-${obj.id}`;
    } else if (obj instanceof Flag) {
      return `flag-${obj.name}`;
    } else if (obj instanceof Resource) {
      return `resource-${obj.resourceType}-${obj.id}`;
    }

    return `unknown-${obj}`;
  },

  Cache: class {
    /**
     * Retrieve the cached value, or invoke the retrieval function
     * @param {string} key the key of the cached value
     * @param {function} fn the function to invoke
     * @return {*} the cached value
     */
    getValue(key, fn) {
      if (!this[key]) {
        this[key] = fn();
      }
      return this[key];
    }

    /**
     * Resets the cached value, so the function will be invoked on next retrieval
     * @param {string} key the cached item to reset
     */
    reset(key) {
      this[key] = null;
    }
  }
};
