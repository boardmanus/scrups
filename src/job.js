/**
 * A job for a worker to perform...
 */
const u = require('utils');


/**
 * Determine the weight of the creep
 * @return {number} weight of the creep
 */
Creep.prototype.weight = function weight() {
  return (this.body.length -
    this.getActiveBodyparts(MOVE) -
    this.getActiveBodyparts(CARRY) +
    _.sum(this.carry) / 50);
};


/**
 * Define some extra properties for creeps to allow polymorphism.
 */
Object.defineProperty(Creep.prototype, 'energy', {
  get: function energy() {
    return this.carry[RESOURCE_ENERGY];
  }
});

Object.defineProperty(Creep.prototype, 'energyCapacity', {
  get: function energyCapacity() {
    return this.carryCapacity;
  }
});


const Job = class Job {

  /**
   * Constructs a new job to be worked.
   * @param {string} type the type of job
   * @param {Structure} site the site of the will take place at
   * @param {integer} instance the job instance value (integer)
   * @param {Creep} worker worker assigned to the job (optional)
   */
  constructor(type, site, instance, worker = null) {
    if (!site) {
      throw new RangeError(`The site of a job can not be null`);
    }
    this.type = type;
    this.site = site;
    this.instance = instance;
    this.worker = worker;
    this.key = `${type}-${instance}-${site.id}`;
  }

  /**
  * @return {string} the unique identifier representing the job.
  */
  id() {
    return this.key;
  }

  /**
   * Generate information about the job
   * @return {string} an info string representing the job
   */
  info() {
    return `job-${this.type}[${this.priority()}] @ ${u.name(this.site)}`;
  }

 /**
  * Determines the priority of the job with respect to the game state.
  * @return {number} the priority
  */
  priority() {
    return Job.Priority.IGNORE;
  }

  /**
   * Determines the completion ratio of the job.
   * @return {number} the completion ratio [0.0, 1.0]
   */
  completion() {
    return 0.0;
  }

  /**
   * Determines the completion ratio of the worker job.
   * If no worker is assigned, the ration is 1.0
   * @return {number} the completion ratio [0.0, 1.0]
   */
  workerCompletion() {
    return 1.0;
  }

  /**
   * Determines how suitable a worker is for a particular job.
   * @param {object} worker of some kind
   * @return {number} suitability of the worker (0.0 - not suitable, 1.0, very sutiable)
   */
  workerSuitability(worker = null) {
    let testWorker = worker || this.worker;
    if (testWorker === null) {
      return 0.0;
    } else if (worker instanceof Creep) {
      return 1.0;
    }
    return 0.0;
  }

  /**
   * Determines the energy required to complete the job.
   * @return {number} the energy required
   */
  energyRequired() {
    return 0.0;
  }

  /**
   * Determines whether the job is complete
   * @return {boolean} whether the job is complete
   */
  isComplete() {
    return this.completion() === 1.0;
  }

  /**
   * Determines whether the job has been assigned to a worker.
   * @return {boolean} whether the job is assigned
   */
  isAssigned() {
    return this.worker !== null;
  }

  /**
   * Assign a worker to the job.
   * @param {Creep} worker the worker to assign the job to.
   */
  assign(worker) {
    this.worker = worker;
  }
};

Job.Priority = {

  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  IDLE: 4,
  IGNORE: 5,

  lower(p) {
    if (p >= Job.Priority.IGNORE) {
      return Job.Priority.IGNORE;
    }
    return p + 1;
  },

  higher(p) {
    if (p <= Job.Priority.CRITICAL) {
      return Job.Priority.CRITICAL;
    }
    return p - 1;
  }
};


module.exports = Job;
