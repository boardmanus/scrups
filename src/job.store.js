/**
 * A storing job for a worker to perform...
 */

const Job = require('job');
const JobUpgrade = require('job.upgrade');
const JobRepair = require('job.repair');
const JobBuild = require('job.build');

/*


function linkPriority(job) {
  const energyRatio = job.completionRatio();
  const importance = job.site.strategicImportance || Job.Priority.NORMAL;
  if (energyRatio < 0.3) {
    return Job.Priority.more(importance);
  } else if (energyRatio > 0.7) {
    return Job.Priority.less(importance);
  }
  return importance;
}

function spawnerPriority(job) {
  const room = job.site.room;
  if (room.energyAvailable === room.energyCapacity) {
    // Already at maximum capacity.
    return Job.Priority.IGNORE;
  }

  const spawnQueue = room.spawnQueue || {};
  let requiredEnergy = 0;
  let spawnPriority = Job.Priority.IGNORE;
  if (spawnQueue.length > 0) {
    spawnPriority = spawnQueue[0].priority();
    spawnQueue.forEach(j => { requiredEnergy += j.requiredEnergy(); });
  } else {
    requiredEnergy = job.site.energy;
  }

  const storePriority = (room.energyAvailable < room.energyCapacity / 2) ?
    Job.Priority.NORMAL : Job.Priority.LOW;

  if (requiredEnergy > room.energyAvailable) {
    return Math.min(spawnPriority, storePriority);
  }

  return storePriority;
}
*/

const JobStore = class JobStore extends Job {

  /**
   * Constructs a new repair job.
   * @param {Structure} site the site to be repaired
   */
  constructor(site) {
    super(JobStore.TYPE, site);
    if (!site.isStorable()) {
      throw new TypeError(`Site not storable - ${site.info()}`);
    }
  }

  /**
   * Determines the priority of a storing job
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.IDLE;
  }

  /**
   * Determines the energy required to finish storing.
   * @return {number} the energy required.
   */
  energyRequired() {
    return this.site.storableSpace();
  }

  /**
   * Transfer the resource to the job site
   * @param {Creep} worker the worker to do the transferring
   * @return {boolean} whether the transfer was successful
   */
  transferToSite(worker) {
    let resource = this.site.storableResource();
    if (resource === RESOURCE_ENERGY) {
      if (worker.carry[RESOURCE_ENERGY] > 0) {
        resource = RESOURCE_ENERGY;
      } else {
        // The worker has no energy to transfer
        throw new Error(`${this.info()}: ${worker.info()} has no energy to transfer to ${this.site.info()}`);
      }
    } else if (resource === RESOURCE_ANY) {
      for (const carriedResource in worker.carry) {
        resource = carriedResource;
        break;
      }
    } else {
      throw new Error(`${this.info}: ${this.site.info()} is not storable!`);
    }

    let res = worker.transfer(this.site, resource);
    switch (res) {
      case ERR_NOT_OWNER:
      case ERR_INVALID_ARGS:
      case ERR_NOT_ENOUGH_RESOURCES:
      case ERR_INVALID_TARGET:
      case ERR_BUSY:
      default:
        throw new Error(`${this.info()}: unexpected error while storing ${worker.carry[resource]} ${resource} (${res})`);
      case ERR_FULL:
        // The site is full - this job is complete
        console.log(`${this.info()}: site is full, bug in store work function.`);
        return false;
      case ERR_NOT_IN_RANGE:
        // Not close enough - move towards the site
        this.moveToSite(worker);
        return false;
      case OK:
        break;
    }
    return true;
  }

  work() {
    _.each(this.workers, w => {
      try {
        this.transferToSite(w);
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
    });
  }
};

JobStore.TYPE = 'store';

/**
 * Factory function to construct storage jobs
 * @param {array} components the components from the job id
 * @return {JobStore} storage job representing the components
 */
Job.Factory[JobStore.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobStore(Game.getObjectById(components[1]));
};


/**
 * A generic room object can not store anything.
 * @param {resource} resource the resource to check
 * @return {boolean} false
 */
const noStorage = function(resource = RESOURCE_ENERGY) {
  return false;
};

const energyOnlyStorage = function(resource = RESOURCE_ENERGY) {
  return resource === RESOURCE_ENERGY;
};

const anyStorage = function(resource = RESOURCE_ENERGY) {
  return true;
};

RoomObject.prototype.isStorable = noStorage;
StructureTower.prototype.isStorable = energyOnlyStorage;
StructureSpawn.prototype.isStorable = energyOnlyStorage;
StructureExtension.prototype.isStorable = energyOnlyStorage;
StructureContainer.prototype.isStorable = anyStorage;
StructureStorage.prototype.isStorable = anyStorage;
StructureTerminal.prototype.isStorable = anyStorage;

Creep.prototype.isStorable = function(resource = RESOURCE_ENERGY) {
  return (
    (resource === RESOURCE_ENERGY) &&
    this.jobs && this.jobs.length &&
    ((this.jobs[0].type === JobUpgrade.TYPE) ||
     (this.jobs[0].type === JobRepair.TYPE) ||
     (this.jobs[0].type === JobBuild.TYPE)));
};


/**
 * Retrieves the amount of space available to store stuff.
 * @return {integer} space avialbe for storage
 */
const noStorageSpace = function() {
  return 0;
};

const energyOnlyStorageSpace = function() {
  return this.energyCapacity - this.energy;
};

const anyStorageSpace = function() {
  return this.storeCapacity - _.sum(this.store);
};

RoomObject.prototype.storableSpace = noStorageSpace;
StructureTower.prototype.storableSpace = energyOnlyStorageSpace;
StructureSpawn.prototype.storableSpace = energyOnlyStorageSpace;
StructureExtension.prototype.storableSpace = energyOnlyStorageSpace;
StructureContainer.prototype.storableSpace = anyStorageSpace;
StructureStorage.prototype.storableSpace = anyStorageSpace;
StructureTerminal.prototype.storableSpace = anyStorageSpace;

Creep.prototype.storableSpace = function() {
  return this.carryCapacity - _.sum(this.carry);
};


/**
 * Retrieves the desired resource type of an object.
 * @return {string} the storable resource
 */
const energyOnlyStorableResource = function() {
  return RESOURCE_ENERGY;
};

const anyStorableResource = function() {
  return RESOURCE_ANY;
};

const noStorableResource = function() {
  return RESOURCE_NONE;
};

RoomObject.prototype.storableResource = noStorableResource;
StructureTower.prototype.storableResource = energyOnlyStorableResource;
StructureSpawn.prototype.storableResource = energyOnlyStorableResource;
StructureExtension.prototype.storableResource = energyOnlyStorableResource;
StructureContainer.prototype.storableResource = anyStorableResource;
StructureStorage.prototype.storableResource = anyStorableResource;
StructureTerminal.prototype.storableResource = anyStorableResource;
Creep.prototype.storableResource = anyStorableResource;


/**
 * Retrieves the desired resource type of an object.
 * @return {string} the storable resource
 */
RoomObject.prototype.storagePriority = function() {
  throw new Error(`Can't store energy in ${this.info()}`);
};

StructureTower.prototype.storagePriority = function() {
  const energyRatio = this.completionRatio();
  const enemiesPresent = (this.room.city.enemies.length > 0);
  if (energyRatio < 0.1) {
    return Job.Priority.CRITICAL;
  } else if (energyRatio < 0.3) {
    return enemiesPresent ? Job.Priority.CRITICAL : Job.Priority.HIGH;
  } else if (energyRatio < 0.5) {
    return enemiesPresent ? Job.Priority.HIGH : Job.Priority.NORMAL;
  } else if (energyRatio < 0.7) {
    return enemiesPresent ? Job.Priority.NORMAL : Job.Priority.LOW;
  }
  return Job.Priority.IDLE;
};

StructureSpawn.prototype.storagePriority = function(job) {
  return Job.Priority.NORMAL;
};

StructureExtension.prototype.storagePriority = function(job) {
  return Job.Priority.NORMAL;
};

StructureContainer.prototype.storagePriority = function(job) {
  return Job.Priority.LOW;
};

StructureStorage.prototype.storagePriority = function(job) {
  return Job.Priority.LOW;
};

StructureTerminal.prototype.storagePriority = function(job) {
  return Job.Priority.LOW;
};

Creep.prototype.storagePriority = function(job) {
  const space = this.carryCapacity - _.sum(this.carry);
  if (space < 50) {
    return Job.Priority.IDLE;
  }

  const energy = this.carry(RESOURCE_ENERGY);
  if (energy < 20) {
    return Job.Priority.HIGH;
  } else if (energy < 50) {
    return Job.Priority.NORMAL;
  } else if (energy < 100) {
    return Job.Priority.LOW;
  }

  return Job.Priority.IDLE;
};

module.exports = JobStore;
