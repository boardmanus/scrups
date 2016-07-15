/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');


function mineralPriority(job) {
  const energyRatio = _.sum(job.site.store) / job.site.storeCapacity;
  if (energyRatio < 0.3) {
    return Job.Priority.LOW;
  }
  return Job.Priority.IDLE;
}

function sourcePriority(job) {
  const source = job.site;
  const numHarvesters = source.numHarvesters || 0;
  const numHarvestPoints = source.numHarvestPoints || 1;
  const energyRatio = source.energy / source.energyCapacity;
  if (numHarvesters >= numHarvestPoints) {
    return Job.Priority.IDLE;
  } else if (energyRatio < 0.2) {
    return Job.Priority.LOW;
  } else if (energyRatio < 0.5) {
    return Job.Priority.NORMAL;
  }

  return Job.Priority.HIGH;
}


const JobHarvest = class JobHarvest extends Job {

  constructor(site) {
    super('harvest', site);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    if (this.site instanceof Mineral) {
      return mineralPriority(this);
    } else if (this.site instanceof Source) {
      return sourcePriority(this);
    }
    return Job.Priority.NONE;
  }
};


module.exports = JobHarvest;
