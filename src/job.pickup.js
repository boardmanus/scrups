/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


const JobPickup = class JobPickup extends Job {

  /**
   * Constructs a new pickup job
   * @param {Object} site to pickup from
   */
  constructor(site) {
    super(JobPickup.TYPE, site);
    if (!(site instanceof StructureContainer ||
          site instanceof StructureStorage ||
          site instanceof StructureLink ||
          site instanceof Resource ||
          site instanceof Creep)) {
      throw new TypeError(`Invalid pickup site`);
    }
  }


  /**
   * Determines the priority of the pickup job
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.IDLE;
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

/**
 * Factory function to construct pickup jobs
 * @param {array} components the components from the job id
 * @return {JobPickup} pickup job representing the components
 */
Job.Factory[JobPickup.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobPickup(Game.getObjectById(components[1]));
};


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
