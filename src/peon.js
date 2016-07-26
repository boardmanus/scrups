/*
 * A base Peon for performing jobs
 */
const u = require('./utils');
const Job = require('./job.all');


const Peon = class Peon {

  constructor(city, creep) {
    this.city = city;
    this.job = null;
    this.operation = null;
    this.creep = creep;
  }

  /**
   * @return an array of job types the peon can work.
   */
  specialization() {
    return Peon.SPECIALIZATION;
  }


  /**
   * Determines whether the peon can work a particular job.
   * @param job the job to test
   * @return true if the peon can work it
   */
  canWorkJob(job) {
    return this.specialization().indexOf(job.type) !== -1;
  }


  /**
   * Determines the best site to collect energy from for the job.
   */
  bestCollectionSite() {
    if (!this.job) {
      return null;
    }

    return this.job.site.bestCollectionSite(this.creep.pos);
  }


  /**
   * Determines whether the peon needs to collect extra energy to perform the
   * job at hand.  More critical jobs allow the creep to have less energy in
   * order to allow them to carry out the job quickly.
   */
  needEnergyForJob() {
    if (!this.job || this.job.type === Job.Harvest.TYPE) {
      return false;
    }

    const siteEnergyRequirements = this.job.site.energyRequired();
    const energy = _.sum(this.creep.carry);
    if (energy > siteEnergyRequirements) {
      return false;
    }

    const energyRatio = energy / this.creep.carryCapacity;
    if (energyRatio > 0.9) {
      return false;
    }

    const requiredRatio = siteEnergyRequirements / this.creep.carryCapacity;
    const priority = this.job.priority();
    switch (priority) {
      case Job.Priority.CRITICAL: return requiredRatio > 5.0;
      case Job.Priority.HIGH: return requiredRatio > 4.0;
      case Job.Priority.NORMAL: return requiredRatio > 2.0;
      default: break;
    }

    return true;
  }

  /**
   * Determines the efficiency the peon will have for a particular job.
   * @param job the job to test
   * @return the effieciency (0.0 - can't do it, 1.0 - most efficient)
   */
  efficiency(job) {
    const energyRatio = _.sum(this.creep.carry) / this.creep.carryCapacity;
    switch (job.type) {
      case Job.Harvest.TYPE: return 1.0 - energyRatio;
      case Job.Repair.TYPE: return 0.25 + energyRatio * 0.75;
      case Job.Store.TYPE: return 0.25 + energyRatio * 0.75;
      case Job.Upgrade.TYPE: return 0.25 + energyRatio * 0.75;
      default: break;
    }
    return 0.0;
  }
};

Peon.TYPE = 'generic';
Peon.BODY_TYPE = [MOVE, WORK, CARRY];
Peon.SPECIALIZATION = [
  Job.Harvest.TYPE,
  Job.Store.TYPE,
  Job.Repair.TYPE,
  Job.Upgrade.TYPE,
];

module.exports = Peon;
