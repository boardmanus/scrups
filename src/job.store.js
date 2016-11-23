/**
 * A storing job for a worker to perform...
 */

const Job = require('job');

/*
function towerPriority(job) {
  const energyRatio = job.completionRatio();
  const enemiesPresent = (job.site.room.city.enemies.length > 0);
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
}

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

function containerPriority(job) {
  const energyRatio = job.completionRatio();
  if (energyRatio < 0.3) {
    return Job.Priority.LOW;
  }
  return job.isComplete() ? Job.Priority.IGNORE : Job.Priority.IDLE;
}

function storagePriority(job) {
  const energyRatio = job.completionRatio();
  if (energyRatio < 0.3) {
    return Job.Priority.LOW;
  }
  return job.isComplete() ? Job.Priority.IGNORE : Job.Priority.IDLE;
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
      throw new TypeError(`Site not storable - ${site.id}`);
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
   * @param {RoomObject} resource the resource to transfer from the worker
   * @return {boolean} whether the transfer was successful
   */
  transferToSite(worker, resource) {
    let res = worker.transfer(this.site, resource);
    switch (res) {
      case ERR_NOT_OWNER:
      case ERR_INVALID_ARGS:
      case ERR_NOT_ENOUGH_RESOURCES:
      case ERR_INVALID_TARGET:
      default:
        throw new Error(`${this.info()}: unexpected error while storing ${w.carry[resource]} ${resource} (${res})`);
      case ERR_FULL:
        // The site is full - this job is complete
        console.log(`${this.info()}: site is full, bug in store work function.`);
        return false;
      case ERR_BUSY:
        // The worker is busy, it's not going to do anything
        console.log(`${this.info}: worker ${w.info()} is busy - can't store.`);
        return false;
      case ERR_NOT_IN_RANGE:
        // Not close enough - move towards the site
        this.moveToSite(w);
        return false;
      case OK:
        break;
    }
    return true;
  }

  work() {
    const allowableResources = this.site.storableResource();
    _.each(this.workers, w => {
      if (allowableResources === RESOURCE_ENERGY) {
        if (w.carry[RESOURCE_ENERGY] > 0) {
          this.transferToSite(w, RESOURCE_ENERGY);
        }
        else {
          // The worker has no energy to transfer
          console.log(`${this.info()}: ${w.info()} has no energy to transfer to ${this.site.info()}`);
        }
      } else if (allowableResources === RESOURCE_ANY) {
        for (const resource in w.carry) {
          this.transferToSite(w, resource);
          break;
        }
      } else {
        throw new Error(`${this.info}: ${this.site.info()} is not storable!`);
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
Creep.prototype.isStorable = anyStorage;
StructureContainer.prototype.isStorable = anyStorage;
StructureStorage.prototype.isStorable = anyStorage;
StructureTerminal.prototype.isStorable = anyStorage;


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


module.exports = JobStore;
