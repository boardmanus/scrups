/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');


/**
 * Determines the priority based on a generic ratio
 * @param ratio where 0.0 is low importance, 1.0 is high.
 * @return the priority based from the ratio
 */
function ratioPriority(ratio) {
  if (ratio < 0.2) {
    return Job.Priority.IDLE;
  } else if (ratio < 0.5) {
    return Job.Priority.LOW;
  } else if (ratio < 0.8) {
    return Job.Priority.NORMAL;
  }
  return Job.Priority.HIGH;
}

/**
 * Determines the priority of a job at a mineral source.
 * @param mineral the mineral site for the job
 * @param harvestRatio the proportion available for harvest
 * @return the priority of harvesting the mineral
 */
function mineralPriority(mineral, harvestRatio) {
  return ratioPriority(mineral.store / mineral.storeCapacity * harvestRatio);
}


/**
 * Determines the priority of a job at an energy source.
 * @param source the source site for the job
 * @param harvestRatio the proportion available for harvest
 * @return the priority of harvesting the source
 */
function sourcePriority(source, harvestRatio) {
  return ratioPriority(source.energy / source.energyCapacity * harvestRatio);
}


const JobHarvest = class JobHarvest extends Job {

  /**
   * Constructs a new harvesting job.
   * @param site the site at which to harvest
   * @param harvestRatio the amount of space available for the job
   */
  constructor(site, harvestRatio) {
    super('harvest', site);
    this.harvestRatio = harvestRatio;
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    if (this.site instanceof Mineral) {
      return mineralPriority(this.site, this.harvestRatio);
    } else if (this.site instanceof Source) {
      return sourcePriority(this.site, this.harvestRatio);
    }
    return Job.Priority.NONE;
  }
};


module.exports = JobHarvest;
