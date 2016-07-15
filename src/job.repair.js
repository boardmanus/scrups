/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');

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

  return Job.Priority.NEVER;
}

function defensePriority(job) {
  const damageRatio = job.site.hits / job.site.hitsMax;
  if (damageRatio < 0.02) {
    return Job.Priority.CRITICAL;
  } else if (damageRatio < 0.04) {
    return Job.Priority.HIGH;
  } else if (damageRatio < 0.08) {
    return Job.Priority.NORMAL;
  } else if (damageRatio < 0.1) {
    return Job.Priority.LOW;
  } else if (damageRatio < 0.9) {
    return Job.Priority.IDLE;
  }

  return Job.Priority.NEVER;
}

function damageRatioPriority(job) {
  const damageRatio = job.site.hits / job.site.hitsMax;
  if (damageRatio < 0.25) {
    return Job.Priority.HIGH;
  } else if (damageRatio < 0.5) {
    return Job.Priority.NORMAL;
  } else if (damageRatio < 0.75) {
    return Job.Priority.LOW;
  } else if (damageRatio < 0.9) {
    return Job.Priority.IDLE;
  }
  return Job.Priority.NEVER;
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

const JobRepair = class JobRepair extends Job {

  constructor(site) {
    super('harvest', site);
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
};


module.exports = JobRepair;
