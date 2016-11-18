/**
 * A Upgrading job for a worker to perform...
 */

const Job = require('job');


const JobUpgrade = class JobUpgrade extends Job {

  /**
   * Constructs a new upgrade job.
   * @param {StructureController} site the controller to be ugraded
   */
  constructor(site) {
    super(JobUpgrade.TYPE, site);
    if (!(site instanceof StructureController)) {
      throw new TypeError("Hey, that's got a be a Controller mate!");
    }
  }


  /**
   * Determines the priority of the upgrade job
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.NORMAL;
  }


  /**
   * Determines the energy required to take the controller to the next level
   * @return {number} energy required
   */
  energyRequired() {
    return 1000;
  }
};


JobUpgrade.TYPE = 'upgrade';

/**
 * Factory function to construct upgrade jobs
 * @param {array} components the components from the job id
 * @return {JobUpgrade} upgrade job representing the components
 */
Job.Factory[JobUpgrade.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`JobUpgrade('${components}' had too many bits`);
  }
  return new JobUpgrade(Game.getObjectById(components[1]));
};


module.exports = JobUpgrade;
