/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');


Creep.proto.repairSuitability = function(site) {
  // Creeps are suitable for repair if it's a big job.
  // Leave the small jobs to the towers.
  const energyForRepair = this.energy;
  if (energyForRepair === 0) {
    return 0.0;
  }

  // If the creep is right next to the site, it's super suitable
  const range = this.pos.rangeTo(site);
  if (range <= 1) {
    return 1.0;
  }

  const workParts = this.getActiveBodyparts(WORK);
  const repairHitsRequired = (site.hitsMax - site.hits);
  const repairHitsPerTick = 100 * workParts;
  const repairEnergyRequired = repairHitsRequired / 100;
};

StructureTower.proto.repairSuitability = function(site) {
  // If the tower can't repair anything, it's not suitable for the job.
  const energyForRepair = this.energyForRepair();
  if (energyForRepair < 10) {
    return 0.0;
  }

  // The tower repairs close things super-duper effectively
  const range = this.pos.rangeTo(site);
  if (range <= 5) {
    return 1.0;
  }

  // If the tower can heal in one shot, it's rather effective.
  const repairHitsRequired = site.hitsMax - site.hits;
  const repairHitsPerTick = 200 + (range - 5) / 20 * 600;
  if (repairHitsRequired < repairHitsPerTick) {
    return 1.0;
  }

  // If the structure can be repaired by the tower, then base the suitability
  // on it's effectiveness
  const repairEffectiveness = repairHitsPerTick / 800;
  if (energyForRepair > energyToRepair) {
    return 0.5 + 0.5 * repairEffectiveness;
  }

  // Otherwise, the sutiability depends on the effectiveness, and how long it
  // will take.
  const ticksForRepair = Math.max(20, repairHitsRequired / repairHitsPerTick);
  const energyToRepair = ticksForRepair * 10;
  const timeEffectiveness = 1.0 - ticksForRepair / 20.0;
  return 0.5 * (timeEffectiveness + repairEffectiveness);
};


function adjustPriority(instance, priority) {
  let newPriority = priority;
  for (let i = 0; i < instance; ++i) {
    newPriority = Job.Priority.lower(priority);
  }
  return newPriority;
}

function damageRatio(site) {
  return site.hits / site.hitsMax;
}

function decayPriority(job) {
  const decay = job.site.ticksToDecay;
  if (decay < 10) {
    return Job.Priority.CRITICAL;
  } else if (decay < 20) {
    return Job.Priority.HIGH;
  } else if (decay < 40) {
    return Job.Priority.NORMAL;
  } else if (decay < 80) {
    return Job.Priority.LOW;
  }

  return Job.Priority.IGNORE;
}

function defensePriority(job) {
  const dr = damageRatio(job.site);
  if (dr < 0.002) {
    return Job.Priority.CRITICAL;
  } else if (dr < 0.004) {
    return Job.Priority.HIGH;
  } else if (dr < 0.008) {
    return Job.Priority.NORMAL;
  } else if (dr < 0.01) {
    return Job.Priority.LOW;
  } else if (dr < 0.09) {
    return Job.Priority.IDLE;
  }

  return Job.Priority.IGNORE;
}

function damageRatioPriority(job) {
  const dr = damageRatio(job.site);
  if (dr < 0.25) {
    return Job.Priority.HIGH;
  } else if (dr < 0.5) {
    return Job.Priority.NORMAL;
  } else if (dr < 0.75) {
    return Job.Priority.LOW;
  } else if (dr < 0.9) {
    return Job.Priority.IDLE;
  }
  return Job.Priority.IGNORE;
}

function roadPriority(job) {
  return Math.min(decayPriority(job), damageRatioPriority(job));
}

function rampartPriority(job) {
  return Math.min(defensePriority(job), decayPriority(job));
}

function wallPriority(job) {
  return defensePriority(job);
}

function energyRequiredForSite(site) {
  const damage = site.hitsMax - site.hits;
  return damage / REPAIR_POWER;
}


const JobRepair = class JobRepair extends Job {

  constructor(site, instance, worker = null) {
    super(JobRepair.TYPE, site, instance, worker);
    if (!site instanceof Structure) {
      throw new TypeError(`Can only repair structures! (site is a ${typeof site})`);
    }
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    let p;
    switch (this.site.structureType) {
      case STRUCTURE_ROAD:
        p = roadPriority(this);
        break;
      case STRUCTURE_RAMPART:
        p = rampartPriority(this);
        break;
      case STRUCTURE_WALL:
        p = wallPriority(this);
        break;
      default:
        p = damageRatioPriority(this);
        break;
    }

    return adjustPriority(this.instance, p);
  }


  /**
   * The ratio of work remaining to repair.
   */
  completion() {
    return damageRatio(this.site);
  }

  workerCompletion() {
    if (worker === null) {
      return 1.0;
    }
    return 1.0 - this.worker.energy() / this.worker.energyCapacity();
  }

  /**
   * Determines the suitability of a worker for a repair job.
   * @param {object} testWorker the worker to test (job worker if null)
   * @return {number} the suitability of the worker
   */
  workerSuitability(testWorker = null) {
    const worker = testWorker || this.worker;
    if (!worker ||
        (!(worker instanceof Creep) && !(worker instanceof StructureTower))) {
      return 0.0;
    }

    return worker.repairSuitability(this.site);
  }

  /**
   * Determine the energy required to finish repairs
   * @return the energy required
   */
  energyRequired() {
    return energyRequiredForSite(this.site);
  }
};

JobRepair.TYPE = 'repair';

JobRepair.maxWorkers = function maxWorkers(site) {
  const energyRequired = energyRequiredForSite(site);
  if (energyRequired < 200) {
    return 1;
  } else if (energyRequired < 1000) {
    return 2;
  } else if (energyRequired < 5000) {
    return 3;
  }
  return 4;
};

module.exports = JobRepair;
