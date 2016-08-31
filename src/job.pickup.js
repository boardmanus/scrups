/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


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
  return this.job && this.job.type === JobHarvest.TYPE && _.sum(this.carry) > 0;
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
  return this.room.find(FIND_MY_STRUCTURES, {
    filter: s => (s.structureType === STRUCTURE_LINK) && (s.energy > 0)
  }).length > 0;
};

module.exports = JobPickup;
