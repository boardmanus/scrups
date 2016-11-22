/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


const JobPickup = class JobPickup extends Job {

  constructor(site, resource = RESOURCE_ANY) {
    super(JobPickup.TYPE, site);
    if (!site.hasPickup(resource)) {
      throw new TypeError(`Invalid pickup site: doesn't have pickup ${site}-${resource}`);
    }

    this.resource = resource;
    this.key = `${this.key}-${resource}`;
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
  if (components.length !== 3) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobPickup(Game.getObjectById(components[1]), components[2]);
};


/**
 * By default, all room objects do *not* have a pickup.
 * @param {string} resource the resource type to pickup
 * @return {boolean} no pickups
 */
RoomObject.prototype.hasPickup = function() {
  return false;
};


/**
 * Stuff that can store all resources has pickup if the resource is present.
 * @param {string} resource the resource type to pickup
 * @return {boolean} whether the resource is present
 */
const hasStoredPickup = function(resource = RESOURCE_ANY) {
  if (resource === RESOURCE_ANY) {
    return _.sum(this.store) > 0;
  }
  return this.store[resource] > 0;
};

StructureContainer.prototype.hasPickup = hasStoredPickup;
StructureStorage.prototype.hasPickup = hasStoredPickup;
StructureTerminal.prototype.hasPickup = hasStoredPickup;


/**
 * Creeps have a pickup if they are harvesting, and are carrying stuff.
 * @param {string} resource the resource type to pickup
 * @return {boolean} can pickup
 */
Creep.prototype.hasPickup = function hasPickup(resource = RESOURCE_ANY) {
  // The creep must be performing a harvest job to have a pickup
  if (!this.job || (this.job.type !== JobHarvest.TYPE)) {
    return false;
  }

  if (resource === RESOURCE_ANY) {
    return _.sum(this.carry) > 0;
  }

  return this.carry[resource] > 0;
};


/**
 * Resources just lying around can be pickup
 * @param {string} resource the resource type to pickup
 * @return {boolean} true always
 */
Resource.prototype.hasPickup = function hasPickup(resource = RESOURCE_ANY) {
  if (resource === RESOURCE_ANY) {
    return this.amount > 0;
  }
  return (resource === this.resourceType) && (this.amount > 0);
};


/**
 * Links with stuff can be picked from
 * @param {string} resource the resource type to pickup
 * @return {boolean} can pickup
 */
StructureLink.prototype.hasPickup = function(resource = RESOURCE_ANY) {
  if (resource !== RESOURCE_ANY && resource !== RESOURCE_ENERGY) {
    return false;
  }

  if (this.energy > 0) {
    return true;
  }

  // If any link has energy, it can be transferred to any other.  This means
  // a link has pickup if any link has energy.
  return this.room.find(FIND_MY_STRUCTURES, {
    filter: s => (s.structureType === STRUCTURE_LINK) && (s.energy > 0)
  }).length > 0;
};



module.exports = JobPickup;
