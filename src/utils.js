/**
 * Provides some basic utilities for logging and such
 */

module.exports = {
  /**
   * Creates a good name for a screeps objects
   * @param obj the screep object to generate a name for
   * @return an nice name for the object
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

  Cache: function Cache() {
    this.getValue = function getValue(key, fn) {
      if (!this[key]) {
        this[key] = fn();
      }
      return this[key];
    };
  },
};
