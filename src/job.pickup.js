/**
 * A building job for a worker to perform...
 */

const Job = require('job');


const JobPickup = class JobPickup extends Job {

  constructor(site, priority) {
    super(JobPickup.TYPE, site, priority);
    if (!(site instanceof StructureContainer ||
          site instanceof StructureStorage ||
          site instanceof StructureLink ||
          site instanceof Resource ||
          site instanceof Creep)) {
      throw new TypeError(`Invalid pickup site`);
    }
  }


  /**
   * Energy required to pickup stuff
   * @return {number} the energy required
   */
  energyRequired() {
    return 0;
  }
};

JobPickup.TYPE = 'pickup';



RoomObject.prototype.hasPickup = function hasPickup() {
  return false;
};

Creep.prototype.hasPickup = function hasPickup() {
  return false;
};

Resource.prototype.hasPickup = function hasPickup() {
  return true;
};

StructureContainer.prototype.hasPickup = function hasPickup() {
  return _.sum(this.store) > 0;
};

StructureStorage.prototype.hasPickup = function hasPickup() {
  return _.sum(this.store) > 0;
};

StructureLink.prototype.hasPickup = function hasPickup() {
  return false;
};

module.exports = JobPickup;
