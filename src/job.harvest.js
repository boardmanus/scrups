/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');
const u = require('utils');


const CACHE = new u.Cache();


/**
 * Determines the number of harvestable sites at a position.
 * @param {object} site the site to check
 * @param {number} x the x pos
 * @param {number} y the y pos
 * @return {number} the number of harvestable positions
 */
function harvestable(site, x, y) {
  const stuff = site.room.lookAt(x, y);
  const thing = _.find(stuff, thing => {
    switch (thing.type) {
      case 'terrain':
        if (thing.terrain === 'wall') {
          return true;
        }
        break;
      case 'structure':
        switch (thing.structure.structureType) {
          case STRUCTURE_ROAD:
            break;
          case STRUCTURE_RAMPART:
            if (!thing.structure.my) {
              return;
            }
            break;
          default:
            return;
        }
        break;
      default:
        break;
    }
  });

  return Boolean(thing);
}


/**
 * Determines the time to harvest the remaining resources of a site
 * @param {object} site the site to check
 * @return {number} the number of ticks to harvest
 */
function harvestTime(site) {
  const available = site.available();
  if (available === 0) {
    return 0;
  }

  const creeps = site.pos.look(FIND_MY_CREEPS, 1);
  if (creeps === 0) {
    return 100000;
  }

  let workParts = 0;
  _.each(creeps, c => {
    workParts += c.getActiveBodyparts(WORK);
  });

  return available / (workParts * 2);
}


/**
 * Determines the job completion time for a mineral extractor
 * @return {number} the estimated number of ticks till complete
 */
Mineral.prototype.harvestCompletion = function() {
  return CACHE.getValue(`${this.id}-completion`, () => harvestTime(this));
};


/**
 * @return {number} the amount of available minerals
 */
Mineral.prototype.available = function() {
  return this.mineralsAvailable;
};


/**
 * Determines the job completion time to extract all energy.
 * @return {number} the estimated ticks to completion
 */
Source.prototype.harvestCompletion = function() {
  return CACHE.getValue(`${this.id}-completion`, () => harvestTime(this));
};


/**
 * @return {number} the amount of available energy
 */
Source.prototype.available = function() {
  return this.energy;
};


/**
 * Determines the priority based on a generic ratio
 * @param {number} ratio where 0.0 is low importance, 1.0 is high.
 * @return {number} the priority based from the ratio
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
   * @param {object} site the site at which to harvest
   * @param {number} instance the job number for harvesting
   * @param {object} worker the worker assigned
   */
  constructor(site, priority) {
    super(JobHarvest.TYPE, site, priority);

    if (!(site instanceof Source ||
            site instanceof Mineral ||
            site instanceof Resource)) {
      throw new TypeError(
        `Can only harvest from sources, minerals or resources! (site is a ${typeof site})`);
    }
  }


  /**
   * No energy is required to harvest.
   * @return {number} 0
   */
  energyRequired() {
    return 0.0;
  }
};

JobHarvest.TYPE = 'harvest';


module.exports = JobHarvest;
