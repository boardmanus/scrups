/**
 * A building job for a worker to perform...
 */

const Job = require('job');


const JobBuild = class JobBuild extends Job {

  constructor(site, priority) {
    super(JobBuild.TYPE, site, priority);
    if (!(site instanceof ConstructionSite)) {
      throw new TypeError(`Can only build construction sites`);
    }
  }


  /**
   * Determine the energy required to finish repairs
   * @return {number} the energy required
   */
  energyRequired() {
    return this.site.progressTotal / BUILD_POWER;
  }
};

JobBuild.TYPE = 'build';


module.exports = JobBuild;
