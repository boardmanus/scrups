/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');

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
  if (dr < 0.02) {
    return Job.Priority.CRITICAL;
  } else if (dr < 0.04) {
    return Job.Priority.HIGH;
  } else if (dr < 0.08) {
    return Job.Priority.NORMAL;
  } else if (dr < 0.1) {
    return Job.Priority.LOW;
  } else if (dr < 0.9) {
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
    switch (this.site.structureType) {
      case STRUCTURE_ROAD: return roadPriority(this);
      case STRUCTURE_RAMPART: return rampartPriority(this);
      case STRUCTURE_WALL: return wallPriority(this);
      default: break;
    }

    return damageRatioPriority(this);
  }


  /**
   * The ratio of work remaining to repair.
   */
  completionRatio() {
    return damageRatio(this.site);
  }


  /**
   * Determine the energy required to finish repairs
   * @return the energy required
   */
  energyRequired() {
    return energyRequiredForSite(this.site);
    const damage = this.site.hitsMax - this.site.hits;
    return damage / REPAIR_POWER;
  }
};

JobRepair.TYPE = 'repair';

JobRepair.maxNumberOfWorkers = function maxNumberOfWorkers(site) {
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
