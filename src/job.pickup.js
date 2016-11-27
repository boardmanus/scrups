/**
 * A building job for a worker to perform...
 */

const Job = require('job');
const JobHarvest = require('job.harvest');


const JobPickup = class JobPickup extends Job {

  constructor(site, resource = RESOURCE_ANY) {
    super(JobPickup.TYPE, site);
    if (!site.hasPickup(resource)) {
      throw new TypeError(`Invalid pickup site: doesn't have pickup ${site.info()}-${resource}`);
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

  /**
   * Gets the worker to pickup resources from the job site.
   * @param {Creep} worker to perform the repairSite
   * @return {boolean} whether the worker did something useful
   */
  pickupFromSite(worker) {
    let res = this.site.pickup(worker, this.resource);
    switch (res) {
      case ERR_NOT_OWNER:
      case ERR_INVALID_TARGET:
      case ERR_NO_BODYPART:
      case ERR_FULL:
      case ERR_BUSY:
      default:
        throw new Error(`${this.info()}: unexpected failure when ${worker.info()} tried picking up from ${this.site.info()} (${res})`);
      case ERR_NOT_ENOUGH_RESOURCES:
          // The site is empty - this job is complete
        console.log(`${this.info()}: ${this.site.info()} doesn't have any ${this.resource} to pickup. (${res})`);
        return false;
      case ERR_NOT_IN_RANGE:
        this.moveToSite(worker);
        return false;
      case OK:
        return true;
    }
  }

  work() {
    _.each(this.workers, w => {
      try {
        this.pickupFromSite(w);
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
    });
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

RoomObject.prototype.pickup = function(worker) {
  throw new Error(`Invalid operation: ${worker.info()} tried to pickup from ${this.info()}`);
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

const withdrawToPickup = function(worker, desiredResource) {
  let resource = desiredResource;
  if (resource === RESOURCE_ANY) {
    for (const r in this.store) {
      resource = r;
      break;
    }
  }
  return worker.withdraw(this, resource);
};

StructureContainer.prototype.hasPickup = hasStoredPickup;
StructureContainer.prototype.pickup = withdrawToPickup;

StructureStorage.prototype.hasPickup = hasStoredPickup;
StructureStorage.prototype.pickup = withdrawToPickup;

StructureTerminal.prototype.hasPickup = hasStoredPickup;
StructureTerminal.prototype.pickup = withdrawToPickup;


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

Creep.prototype.pickup = function(worker, desiredResource) {
  let resource = desiredResource;
  if (resource === RESOURCE_ANY) {
    for (const r in this.carry) {
      resource = r;
      break;
    }
  }
  return worker.withdraw(this.site, resource);
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

Resource.prototype.pickup = function(worker, desiredResource) {
  return worker.pickup(this);
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

Resource.prototype.pickup = function(worker, desiredResource) {
  return worker.withdraw(this, RESOURCE_ENERGY);
};


module.exports = JobPickup;
