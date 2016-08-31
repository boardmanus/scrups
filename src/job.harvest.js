/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');



const JobHarvest = class JobHarvest extends Job {

  /**
   * Constructs a new harvesting job.
   * @param {object} site the site at which to harvest
   * @param {number} priority the job number for harvesting
   */
  constructor(site, priority) {
    super(JobHarvest.TYPE, site, priority);

    if (!(site instanceof Source || site instanceof Mineral)) {
      throw new TypeError(
        `Can only harvest from sources or minerals! (site is a ${typeof site})`);
    }

    if (!site.isHarvestable()) {
      throw new RangeError('Sites must be harvestable');
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


/**
 * Determines whether the mineral desposit is harvestable
 * @return {boolean} whether the deposit is harvestable.
 */
Mineral.prototype.isHarvestable = function isHarvestable() {
  return this.pos.lookFor(LOOK_STRUCTURES).length > 0;
};


/**
 * @return {resources} the amount and type of available minerals
 */
Mineral.prototype.harvestableResources = function() {
  return {type: this.mineralType, amount: this.mineralAmount};
};


/**
 * Determines whether the mineral desposit is harvestable
 * @return {boolean} whether the source is harvestable.
 */
Source.prototype.isHarvestable = function isHarvestable() {
  return true;
};


/**
 * @return {number} the amount of available energy
 */
Source.prototype.harvestableResources = function() {
  return {type: RESOURCE_ENERGY, amount: this.energy};
};


module.exports = JobHarvest;
