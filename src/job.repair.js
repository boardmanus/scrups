/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');

Creep.proto.energy = function() {
  return this.carry[RESOURCE_ENERGY];
};

Creep.proto.energyCapacity = function() {
  return this.carryCapacity;
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
