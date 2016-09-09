/**
 * A Upgrading job for a worker to perform...
 */

const Job = require('job');


const JobUpgrade = class JobUpgrade extends Job {

  constructor(site, priority) {
    super(JobUpgrade.TYPE, site, priority);
    if (!(site instanceof StructureController)) {
      throw new TypeError("Hey, that's got a be a Controller mate!");
    }
  }

  /**
   * Determines the energy required to take the controller to the next level
   * @return the energy required
   */
  energyRequired() {
    return 1000;
  }
};


JobUpgrade.TYPE = 'upgrade';

module.exports = JobUpgrade;
