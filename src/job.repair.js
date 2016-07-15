/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');


const JobRepair = class JobRepair extends Job {

  constructor(site) {
    super('harvest', site);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    switch (this.site.structureType) {
//      case STRUCTURE_TOWER: return towerPriority(this);
//      case STRUCTURE_LINK: return linkPriority(this);
//      case STRUCTURE_SPAWN:
//      case STRUCTURE_EXTENSION: return spawnerPriority(this);
//      case STRUCTURE_CONTAINER: return containerPriority(this);
//      case STRUCTURE_STORAGE: return storagePriority(this);
      default: break;
    }
    return Job.Priority.IDLE;
  }
};


module.exports = JobRepair;
