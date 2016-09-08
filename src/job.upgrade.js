/**
 * A Upgrading job for a worker to perform...
 */

const Job = require('job');


const JobUpgrade = class JobUpgrade extends Job {

  constructor(site, priority) {
    super(JobUpgrade.TYPE, site, priority);
  }

  /**
   * Always require energy to upgrade a controller
   * @return {number} energy required
   */
  energyRequired() {
    return 1000;
  }
};

JobUpgrade.TYPE = 'upgrade';

module.exports = JobUpgrade;
