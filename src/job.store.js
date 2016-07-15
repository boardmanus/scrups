/**
 * A storing job for a worker to perform...
 */

const Job = require('job');

function towerPriority(job) {
  const energyRatio = job.site.energy / job.site.energyCapacity;
  const enemiesPresent = (job.site.room.enemies.length > 0);
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
  const energyRatio = job.site.energy / job.site.energyCapacity;
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
  const spawnQueue = room.spawnQueue || {};
  let requiredEnergy = 0;
  let spawnPriority = Job.Priority.LOW;
  if (spawnQueue.length > 0) {
    spawnPriority = spawnQueue[0].priority();
    spawnQueue.forEach((j) => { requiredEnergy += j.requiredEnergy(); });
  } else {
    requiredEnergy = job.site.energy;
  }

  if (requiredEnergy > room.energyAvailable) {
    return spawnPriority;
  } else if (room.energyAvailable < room.energyCapacity) {
    return Job.Priority.LOW;
  }

  return Job.Priority.NEVER;
}

function containerPriority(job) {
  const energyRatio = _.sum(job.site.store) / job.site.storeCapacity;
  if (energyRatio < 0.3) {
    return Job.Priority.LOW;
  }
  return Job.Priority.IDLE;
}

function storagePriority(job) {
  const energyRatio = _.sum(job.site.store) / job.site.storeCapacity;
  if (energyRatio < 0.3) {
    return Job.Priority.LOW;
  }
  return Job.Priority.IDLE;
}


const JobStore = class JobStore extends Job {

  constructor(site) {
    super('store', site);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    switch (this.site.structureType) {
      case STRUCTURE_TOWER: return towerPriority(this);
      case STRUCTURE_LINK: return linkPriority(this);
      case STRUCTURE_SPAWN:
      case STRUCTURE_EXTENSION: return spawnerPriority(this);
      case STRUCTURE_CONTAINER: return containerPriority(this);
      case STRUCTURE_STORAGE: return storagePriority(this);
      default: break;
    }
    return Job.Priority.IDLE;
  }
};


module.exports = JobStore;
