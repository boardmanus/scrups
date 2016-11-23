/**
 * A harvesting job for a worker to perform...
 */

const Job = require('job');


/**
 * A job to repair a structure
 */
const JobRepair = class JobRepair extends Job {

  /**
   * Constructs a new repair job.
   * @param {Structure} site the site to be repaired
   */
  constructor(site) {
    super(JobRepair.TYPE, site);
    if (!(site instanceof Structure)) {
      throw new TypeError(`Can only repair structures! (site is a ${typeof site})`);
    }
  }

  /**
   * Determines the priority of a repair job
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.IDLE;
  }


  /**
   * Determine the energy required to finish repairs
   * @return {number} the energy required
   */
  energyRequired() {
    const damage = this.site.hitsMax - this.site.hits;
    return damage / REPAIR_POWER;
  }


  /**
   * Assigns a Tower or Creep to repair the site
   * @param {Creep|Tower} worker the worker used to repair
   */
  assignWorker(worker) {
    if (!worker) {
      throw new RangeError('Worker must be a valid Tower or Creep');
    }
    if (!(worker instanceof Creep) && !(worker instanceof StructureTower)) {
      throw new TypeError('Worker must be a Creep or StructureTower');
    }

    this.workers.push(worker);
  }

  work() {
    _.each(this.workers, w => {
      let res = w.repair(this.site);
      switch (res) {
        case ERR_NOT_OWNER:
        case ERR_INVALID_TARGET:
        case ERR_NO_BODY_PART:
        case ERR_BUSY:
        default:
          throw new Error(`${this.info()}: unexpected failure when repairing (${res})`);
        case ERR_NOT_ENOUGH_RESOURCES:
          break;
        case ERR_NOT_IN_RANGE:
          this.moveToSite(w);
          break;
        case OK:
          break;
      }
    });
  }
};


JobRepair.TYPE = 'repair';


/**
 * Factory function to construct repair jobs
 * @param {array} components the components from the job id
 * @return {JobRepair} repair job representing the components
 */
Job.Factory[JobRepair.TYPE] = function(components) {
  if (components.length !== 2) {
    throw new RangeError(`'${components}' had too many bits`);
  }
  return new JobRepair(Game.getObjectById(components[1]));
};


/*
Creep.prototype.repairSuitability = function(site) {
  // Creeps are suitable for repair if it's a big job.
  // Leave the small jobs to the towers.
  const energyForRepair = this.energy;
  if (energyForRepair === 0) {
    return 0.0;
  }

  const workParts = this.getActiveBodyparts(WORK);
  if (workParts === 0) {
    // Can't repair with no work-parts
    return 0.0;
  }

  // If the creep is right next to the site, it's super suitable
  const range = this.pos.rangeTo(site);
  if (range <= 3) {
    return 1.0;
  }

  // Approx ticks to get to site
  const moveParts = this.getActiveBodyparts(MOVE);
  const repairHitsRequired = (site.hitsMax - site.hits);
  const repairEnergyRequired = repairHitsRequired / 100;
  const weight = this.weight();
  const timeBetweenMoves = Math.ceil(weight / moveParts);
  const travelTime = TRAVEL_TIME_MODIFIER * timeBetweenMoves * range;
  const repairTime = repairEnergyRequired / workParts;

  // If the travel time for the creep is greater than so many ticks,
  // the repair time will be less than half the travel-time, it's not suitable.
  if (travelTime > 9 && repairTime < travelTime / 2) {
    return 0.0;
  }
};

StructureTower.prototype.repairSuitability = function(site) {
  // If the tower can't repair anything, it's not suitable for the job.
  const energyForRepair = this.energyForRepair();
  if (energyForRepair < 10) {
    return 0.0;
  }

  // The tower repairs close things super-duper effectively
  const range = this.pos.rangeTo(site);
  if (range <= 5) {
    return 1.0;
  }

  // If the tower can heal in one shot, it's rather effective.
  const repairHitsRequired = site.hitsMax - site.hits;
  const repairHitsPerTick = 200 + (range - 5) / 20 * 600;
  if (repairHitsRequired < repairHitsPerTick) {
    return 1.0;
  }

  // If the structure can be repaired by the tower, then base the suitability
  // on it's effectiveness
  const ticksForRepair = Math.max(20, repairHitsRequired / repairHitsPerTick);
  const energyToRepair = ticksForRepair * 10;
  const repairEffectiveness = repairHitsPerTick / 800;
  if (energyForRepair > energyToRepair) {
    return 0.5 + 0.5 * repairEffectiveness;
  }

  // Otherwise, the sutiability depends on the effectiveness, and how long it
  // will take.
  const timeEffectiveness = 1.0 - ticksForRepair / 20.0;
  return 0.5 * (timeEffectiveness + repairEffectiveness);
};
*/


module.exports = JobRepair;
