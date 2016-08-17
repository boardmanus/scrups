/*
 * A base Peon for performing jobs
 */
const Job = require('./job.all');

const Peon = class Peon {

  constructor(city, creep) {
    this.city = city;
    this.creep = creep;
    this.job = null;
    this.operation = creep.memory.operation;
    this.phase = creep.memory.phase;
    this.jobId = creep.memory.jobId;
  }

  info() {
    return `peon-${this.creep.name}`;
  }

  /**
   * Assign a job to the worker.
   */
  assign(job) {
    this.job = job;
    if (job) {
      this.creep.memory.jobId = job.id();
      job.assign(this);
    } else {
      this.creep.memory.jobId = null;
    }
  }

  /**
   * @return an array of job types the peon can work.
   */
  specialization() {
    return Peon.SPECIALIZATION;
  }

  /**
   * @return the ratio of carried energy to capacity.
   */
  carryRatio() {
    if (this.creep.carryCapacity === 0) {
      return 0.0;
    }

    return _.sum(this.creep.carry) / this.creep.carryCapacity;
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

    return this.city.bestCollectionSite(this.creep.pos);
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

    const jobEnergyRequirements = this.job.energyRequired();
    const energy = _.sum(this.creep.carry);
    if (energy > jobEnergyRequirements) {
      return false;
    }

    const energyRatio = energy / this.creep.carryCapacity;
    if (energyRatio > 0.9) {
      return false;
    }

    const requiredRatio = jobEnergyRequirements / this.creep.carryCapacity;
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
    let energyRatio = 0;
    const carryRatio = () => _.sum(this.creep.carry) / this.creep.carryCapacity;
    const distanceRatio = (50 - job.site.pos.getRangeTo(this.creep)) / 50.0;
    switch (job.type) {
      case Job.Harvest.TYPE: energyRatio = (1.0 - carryRatio()); break;
      case Job.Repair.TYPE: energyRatio = (0.25 + energyRatio * 0.75); break;
      case Job.Store.TYPE: energyRatio = (0.25 + energyRatio * 0.75); break;
      case Job.Upgrade.TYPE: energyRatio = (0.25 + energyRatio * 0.75); break;
      default: return 0.0;
    }
    return energyRatio * distanceRatio;
  }
};

Peon.TYPE = 'peon';

Peon.BODY_TYPE = [MOVE, WORK, CARRY];

Peon.SPECIALIZATION = [
  Job.Harvest.TYPE,
  Job.Store.TYPE,
  Job.Repair.TYPE,
  Job.Upgrade.TYPE
];

module.exports = Peon;
