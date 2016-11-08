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


function energyRequiredForSite(site) {
  switch (site.structureType) {
    case STRUCTURE_TOWER:
    case STRUCTURE_LINK:
    case STRUCTURE_SPAWN:
    case STRUCTURE_EXTENSION:
      return site.energyCapacity - site.energyAvailable;
    case STRUCTURE_CONTAINER:
    case STRUCTURE_STORAGE:
      return site.storeCapacity - _.sum(site.store);
    default: break;
  }
  return 0;
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


const allStorable = function(resourceType) {
  return true;
};
const isntStorable = function(resourceType) {
  return false;
};
const energyStorable = function(resourceType) {
  return resourceType === undefined || resourceType === RESOURCE_ENERGY;
};

RoomObject.prototype.isStorable = isntStorable;
StructureExtension.prototype.isStorable = energyStorable;
StructureSpawn.prototype.isStorable = energyStorable;
StructureLink.prototype.isStorable = energyStorable;
StructureTower.prototype.isStorable = energyStorable;
StructureStorage.prototype.isStorable = allStorable;
StructureContainer.prototype.isStorable = allStorable;
StructureTerminal.prototype.isStorable = allStorable;

const noSpace = function() {
  return 0;
};
const allSpace = function() {
  return this.storeCapacity - _.sum(this.store);
};
const energySpace = function() {
  return this.energyCapacity - this.energy;
};

RoomObject.prototype.storableSpace = noSpace;
StructureExtension.prototype.storableSpace = energySpace;
StructureSpawn.prototype.storableSpace = energySpace;
StructureLink.prototype.storableSpace = energySpace;
StructureTower.prototype.storableSpace = energySpace;
StructureStorage.prototype.storableSpace = allSpace;
StructureContainer.prototype.storableSpace = allSpace;
StructureTerminal.prototype.storableSpace = allSpace;

module.exports = JobStore;
