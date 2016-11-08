/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


const JobPickup = class JobPickup extends Job {

  constructor(site) {
    super(JobPickup.TYPE, site);
    if (!site.hasPickup()) {
      throw new TypeError(`Invalid pickup site`);
    }
  }

  /**
   * Determines the priority of a repair job
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
 * Factory function to construct repair jobs
 * @param {array} components the components from the job id
 * @return {JobRepair} repair job representing the components
 */
Job.Factory[JobPickup.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobPickup(Game.getObjectById(components[1]));
};


/**
 * By default, all room objects do *not* have a pickup.
 * @return {boolean} no pickups
 */
RoomObject.prototype.hasPickup = function hasPickup() {
  return false;
};


/**
 * Creeps have a pickup if they are harvesting, and are carrying stuff.
 * @return {boolean} can pickup
 */
Creep.prototype.hasPickup = function hasPickup() {
  return this.job && this.job.type === JobHarvest.TYPE && _.sum(this.carry) > 0;
};


/**
 * Resources just lying around can be pickup
 * @return {boolean} true always
 */
Resource.prototype.hasPickup = function hasPickup() {
  return true;
};


/**
 * Containers with stuff in them can be picked from
 * @return {boolean} can pickup
 */
StructureContainer.prototype.hasPickup = function hasPickup() {
  return _.sum(this.store) > 0;
};


/**
 * Storage boxes with stuff in them can be picked from
 * @return {boolean} can pickup
 */
StructureStorage.prototype.hasPickup = function hasPickup() {
  return _.sum(this.store) > 0;
};


/**
 * Links with stuff can be picked from
 * @return {boolean} can pickup
 */
StructureLink.prototype.hasPickup = function hasPickup() {
  return this.energy > 0;
  /*
  return this.room.boss.find(FIND_MY_STRUCTURES, {
    filter: s => (s.structureType === STRUCTURE_LINK) && (s.energy > 0)
  }).length > 0;
  */
};

module.exports = JobPickup;
