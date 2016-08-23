/**
 * A building job for a worker to perform...
 */

const Job = require('job');


const JobBuild = class JobBuild extends Job {

  constructor(site, instance, worker = null) {
    super(JobBuild.TYPE, site, instance, worker);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    return Job.Priority.NORMAL;
  }


  /**
   * Determines the estimated number of ticks till completion
   * @return {number} the number of ticks before the job will be completed
   */
  completion() {
    return 0.0;
  }


  /**
   * Determines the completion ratio of the worker job.
   * If no worker is assigned, the ration is 1.0
   * @return {number} the number of ticks before the worker will be finished
   */
  workerCompletion() {
    return 0;
  }


  /**
   * Determine the energy required to finish repairs
   * @return the energy required
   */
  energyRequired() {
    return 0;
  }
};

JobBuild.TYPE = 'build';

JobBuild.maxWorkers = function maxWorkers(site) {
  return 1;
};

module.exports = JobBuild;
