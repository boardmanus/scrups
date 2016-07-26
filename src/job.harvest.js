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


function mineralCompletion(mineral) {
  return mineral.store / mineral.storeCapacity;
}


function sourceCompletion(source) {
  return source.energy / source.energyCapacity;
}


/**
 * Determines the priority of a job at a mineral source.
 * @param mineral the mineral site for the job
 * @param harvestRatio the proportion available for harvest
 * @return the priority of harvesting the mineral
 */
function mineralPriority(mineral, harvestRatio) {
  return ratioPriority(mineralCompletion(mineral) * harvestRatio);
}


/**
 * Determines the priority of a job at an energy source.
 * @param source the source site for the job
 * @param harvestRatio the proportion available for harvest
 * @return the priority of harvesting the source
 */
function sourcePriority(source, harvestRatio) {
  return ratioPriority(sourceCompletion(source) * harvestRatio);
}


const JobHarvest = class JobHarvest extends Job {

  /**
   * Constructs a new harvesting job.
   * @param site the site at which to harvest
   * @param harvestRatio the amount of space available for the job
   */
  constructor(site, harvestRatio) {
    super(JobHarvest.TYPE, site);
    this.harvestRatio = harvestRatio;
    if (this.site instanceof Mineral) {
      this.fPriority = mineralPriority;
      this.fCompletionRatio = mineralCompletion;
    } else if (this.site instanceof Source) {
      this.fPriority = sourcePriority;
      this.fCompletionRatio = sourceCompletion;
    } else {
      this.fPriority = () => Job.Priority.IGNORE;
      this.fCompletionRatio = () => 0.0;
    }
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    return this.fPriority(this.site, this.harvestRatio);
  }


  /**
   * Completion is determined by how much energy is left at the site
   */
  completionRatio() {
    return this.fCompletionRatio(this.site);
  }
};

JobHarvest.TYPE = 'harvest';

module.exports = JobHarvest;
