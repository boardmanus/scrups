/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');
const City = require('city');
const u = require('utils');


const CACHE = new u.Cache();


Mineral.prototype.completion = function() {
  return CACHE.getValue(`${this.id}-completion`, () => {
    const availableMinerals = this.mineralAmount;
    if (availableMinerals === 0) {
      return 0;
    }

    let spots = 0;
    for (let x = -1; x < 2; ++x) {
      for (let y = -1; y < 2; ++y) {
        const terrain = this.room.lookForAt(
          LOOK_TERRAIN, this.pos.x + x, this.pos.y + y);
        if (terrain !== 'wall') {
          ++spots;
        }
      }
    }
    const creeps = this.pos.look(FIND_MY_CREEPS, 1);
    if (creeps === 0) {
      return 100000;
    }

    let workParts = 0;
    _.each(creeps, c => {
      workParts += c.getActiveBodyparts(WORK);
    });
  });
};

Mineral.prototype.available = function() {
  return this.store;
};

Source.prototype.completion = function() {
  return this.energy / this.energyCapacity;
};

Source.prototype.available = function() {
  return this.energy;
};


/**
 * Determines the priority based on a generic ratio
 * @param ratio where 0.0 is low importance, 1.0 is high.
 * @return the priority based from the ratio
 */
function ratioPriority(ratio) {
  if (ratio < 0.2) {
    return Job.Priority.IDLE;
  } else if (ratio < 0.5) {
    return Job.Priority.LOW;
  } else if (ratio < 0.8) {
    return Job.Priority.NORMAL;
  }
  return Job.Priority.HIGH;
}


const JobHarvest = class JobHarvest extends Job {

  /**
   * Constructs a new harvesting job.
   * @param site the site at which to harvest
   * @param instance the job number for harvesting
   * @param worker the worker assigned
   */
  constructor(site, instance, worker = null) {
    super(JobHarvest.TYPE, site, instance, worker);
  }


 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    const completion = this.site.completion();
    return ratioPriority(completion * (1.0 - completion) / this.instance);
  }


  /**
   * No energy is required to harvest.
   */
  energyRequired() {
    return 0.0;
  }


  /**
   * Completion is determined by how much energy is left at the site
   * @return {number} the job completion ratio
   */
  completion() {
    return this.site.completion();
  }


  /**
   * Number of ticks until the worker is full of energy/minerals
   * @return {number} the number of ticks required
   */
  workerCompletion() {
    if (this.worker === null) {
      return 0;
    }

    const spaceRemaining = this.worker.carryCapacity - _.sum(this.worker.carry);
  }
};

JobHarvest.TYPE = 'harvest';

JobHarvest.maxWorkers = function maxWorkers(site) {
  // TODO: look at location, and determine the desired number of harvest jobs
  return 3;
};

module.exports = JobHarvest;
