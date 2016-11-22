/**
 * Provides some basic utilities for logging and such
 */
global.RESOURCE_ANY = 'any';
global.RESOURCE_NONE = 'none';

RoomObject.prototype.info = function() {
  return `unknown-${this.constructor.name}-${this.room.name}`;
};

Creep.prototype.info = function() {
  return this.my ?
    `creep-${this.name}-${this.room.name}` :
    `enemy-${this.name}-${this.owner}`;
};

Structure.prototype.info = function() {
  return `${this.structureType}-${this.room.name}-${this.id}`;
};

Room.prototype.info = function() {
  return `room-${this.name}`;
};

Source.prototype.info = function() {
  return `source-${this.room.name}-${this.id}`;
};

Flag.prototype.info = function() {
  return `flag-${this.name}-${this.room.name}`;
};

Resource.prototype.info = function() {
  return `resource-${this.resourceType}-${this.amount}-${this.id}`;
};

module.exports = {

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
