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
   * The ratio of work remaining to repair.
   */
  completionRatio() {
    return 0.0;
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


module.exports = JobBuild;
