/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


const JobPickup = class JobPickup extends Job {

  constructor(site, resource = RESOURCE_ENERGY) {
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
 * @return {boolean} no pickups
 */
const doesntHavePickup = function() {
  return false;
};

const hasStoredPickup = function(resource = RESOURCE_ENERGY) {
  return this.store[resource] > 0;
};

const hasEnergyPickup = function(resource = RESOURCE_ENERGY) {
  return (resource === RESOURCE_ENERGY) && (this.energy > 0);
};



RoomObject.prototype.hasPickup = doesntHavePickup;
StructureContainer.prototype.hasPickup = hasStoredPickup;
StructureStorage.prototype.hasPickup = hasStoredPickup;
StructureTerminal.prototype.hasPickup = hasStoredPickup;


/**
 * Creeps have a pickup if they are harvesting, and are carrying stuff.
 * @param {string} resource the resource type to pickup
 * @return {boolean} can pickup
 */
Creep.prototype.hasPickup = function hasPickup(resource = RESOURCE_ENERGY) {
  return this.job && (this.job.type === JobHarvest.TYPE) && (this.carry[resource] > 0);
};


/**
 * Resources just lying around can be pickup
 * @param {string} resource the resource type to pickup
 * @return {boolean} true always
 */
Resource.prototype.hasPickup = function hasPickup(resource = RESOURCE_ENERGY) {
  console.log(`Resource.hasPickup(${resource}): ${this.resourceType}, ${this.amount}`);
  return resource === this.resourceType && this.amount > 0;
};


/**
 * Links with stuff can be picked from
 * @param {string} resource the resource type to pickup
 * @return {boolean} can pickup
 */
StructureLink.prototype.hasPickup = function(resource = RESOURCE_ENERGY) {
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
