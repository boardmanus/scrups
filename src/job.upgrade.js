/**
 * A Upgrading job for a worker to perform...
 */

const Job = require('job');


const JobUpgrade = class JobUpgrade extends Job {

  constructor(site) {
    super(JobUpgrade.TYPE, site);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    const controller = this.site;
    const numUpgraders = controller.numUpgraders || 0;
    const downgradeRatio =
      controller.ticksToLive / CONTROLLER_DOWNGRADE[controller.level];
    if (numUpgraders === 0) {
      if (downgradeRatio < 0.1) {
        return Job.Priority.CRITICAL;
      } else if (downgradeRatio < 0.5) {
        return Job.Priority.HIGH;
      }
      return Job.Priority.NORMAL;
    } else if (numUpgraders <= 2) {
      return Job.Priority.NORMAL;
    }

    return Job.Priority.IDLE;
  }

  /**
   * Completion is relative to the next controller level.
   */
  completionRatio() {
    return this.site.progress / (this.site.progress + this.site.progressTotal);
  }
};

JobUpgrade.TYPE = 'upgrade';

module.exports = JobUpgrade;
