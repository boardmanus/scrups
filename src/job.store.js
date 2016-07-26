/**
 * A storing job for a worker to perform...
 */

const Job = require('job');

function towerPriority(job) {
  const energyRatio = job.completionRatio();
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
    spawnQueue.forEach((j) => { requiredEnergy += j.requiredEnergy(); });
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


const JobStore = class JobStore extends Job {

  constructor(site) {
    super(JobStore.TYPE, site);
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
    return Job.Priority.IGNORE;
  }


  /**
   * Completion ratio is how full the site is.
   */
  completionRatio() {
    switch (this.site.structureType) {
      case STRUCTURE_TOWER:
      case STRUCTURE_LINK:
      case STRUCTURE_SPAWN:
        return this.site.energyAvailable / this.site.energyCapacity;
      case STRUCTURE_EXTENSION:
        return this.site.room.energyAvailable / this.site.room.energyCapacity;
      case STRUCTURE_CONTAINER:
      case STRUCTURE_STORAGE:
        return _.sum(this.site.store) / this.site.storeCapacity;
      default: break;
    }
    return 1.0;
  }
};

JobStore.TYPE = 'store';

module.exports = JobStore;
