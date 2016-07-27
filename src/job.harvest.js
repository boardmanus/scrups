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
   * @param instance the job number for harvesting
   * @param worker the worker assigned
   */
  constructor(site, instance, worker = null) {
    super(JobHarvest.TYPE, site, instance, worker);
    if (this.site instanceof Mineral) {
      this.harvestRatio = (1.0 - mineralCompletion(site)) / instance;
      this.fPriority = mineralPriority;
    } else if (this.site instanceof Source) {
      this.harvestRatio = (1.0 - sourceCompletion(site)) / instance;
      this.fPriority = sourcePriority;
    } else {
      this.fPriority = () => Job.Priority.IGNORE;
    }
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    return this.fPriority(this.site, this.harvestRatio);
  }


  /**
   * No energy is required to harvest energy.
   */
  energyRequired() {
    return 0.0;
  }


  /**
   * Completion is determined by how much energy is left at the site
   */
  completionRatio() {
    if (this.worker == null) {
      return 0.0;
    }

    return this.worker.carryRatio();
  }
};

JobHarvest.TYPE = 'harvest';

JobHarvest.maxNumberOfWorkers = function maxNumberOfWorkers(site) {
  // TODO: look at location, and determine the desired number of harvest jobs
  return 3;
};

module.exports = JobHarvest;
