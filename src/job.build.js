/**
 * A building job for a worker to perform...
 */

const Job = require('job');

const JobBuild = class JobBuild extends Job {

  /**
   * Constructs a new build job.
   * @param {ConstructionSite} site the construction site to be built
   */
  constructor(site) {
    super(JobBuild.TYPE, site);
    if (!(site instanceof ConstructionSite)) {
      throw new TypeError(`Can only build construction sites`);
    }
  }

  /**
   * Determines the priority of a build job
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.NORMAL;
  }

  /**
   * Determine the energy required to finish repairs
   * @return {number} the energy required
   */
  energyRequired() {
    return this.site.progressTotal / BUILD_POWER;
  }

  /**
   * Perform the job.
   */
  work() {
  }
};

JobBuild.TYPE = 'build';


/**
 * Factory function to construct build jobs
 * @param {array} components the components from the job id
 * @return {JobBuild} build job representing the components
 */
Job.Factory[JobBuild.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobBuild(Game.getObjectById(components[1]));
};


module.exports = JobBuild;
