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

  /**
   * Upgrades the controller
   * @param {Creep} worker the worker to do the upgrading
   * @return {boolean} whether the upgrade was successful
   */
  upgradeSite(worker) {
    let res = worker.upgradeController(this.site);
    switch (res) {
      case ERR_NOT_OWNER:
      case ERR_INVALID_ARGS:
      case ERR_INVALID_TARGET:
      case ERR_NOT_ENOUGH_RESOURCES:
      case ERR_BUSY:
      default:
        throw new Error(`${this.info()}: unexpected error while storing ${worker.carry[resource]} ${resource} (${res})`);
      case ERR_NOT_IN_RANGE:
        // Not close enough - move towards the site
        this.moveToSite(worker);
        return false;
      case OK:
        break;
    }
    return true;
  }

  work() {
    _.each(this.workers, w => {
      try {
        this.upgradeSite(w);
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
    });
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
