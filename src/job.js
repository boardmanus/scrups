/**
 * A job for a worker to perform...
 */
const u = require('utils');


/**
 * Base job
 */
const Job = class Job {

  /**
   * Constructs a new job to be worked.
   * @param {string} type the type of job
   * @param {Structure} site the site of the will take place at
   */
  constructor(type, site) {
    if (!site) {
      throw new RangeError(`The site of a job can not be null`);
    }
    this.type = type;
    this.site = site;
    this.workers = [];
    this.key = `${type}-${site.id}`;
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
    return `job-${this.type}[${this.priority()}]@${this.site.info()}`;
  }

  /**
   * Priority of the job
   * @return {Job.Priority} priority of the job
   */
  priority() {
    return Job.Priority.IGNORE;
  }

  /**
   * Determines the energy required to complete the job.
   * @return {number} the energy required
   */
  energyRequired() {
    return 0.0;
  }

  /**
   * Assign a worker to the job.
   * @param {Creep} worker the worker to assign the job to.
   */
  assignWorker(worker) {
    if (!worker) {
      throw new RangeError('Must pass a valid object');
    }
    if (!(worker instanceof Creep)) {
      throw new TypeError('Job only expects creeps');
    }
    this.workers.push(worker);
  }

  /**
   * Perform the job.
   */
  work() {
    throw new Error("Job not implemented!");
  }

  /*
   * Move a worker towards the job site
   * @param {Creep} worker the worker to move
   * @return {boolean} whether the operation was successful
   */
  moveToSite(worker) {
    let res = worker.moveTo(this.site);
    switch (res) {
      case ERR_NOT_OWNER:
      case ERR_BUSY:
      case ERR_NO_BODYPART:
      case ERR_INVALID_TARGET:
      default:
        throw new Error(`${this.info()}: ${worker.info()} failed to move to ${this.site.info()} (${res})`);
      case ERR_TIRED:
        console.log(`${this.info()}: ${worker.info()} was to tired to move to ${this.site.info()}`);
        return false;
      case OK:
        break;
    }

    return true;
  }
};


/**
 * Factory hash populated as job types are imported
 * @type {function}
 */
Job.Factory = {
};


/**
 * Creates a job based on a passed in job-id
 * @param {string} id the id of the job to construct
 * @return {Job} job created
 */
Job.create = function(id) {
  if (id === null) {
    throw new RangeError("id can't be null");
  }

  const components = id.split('-');
  const creator = Job.Factory[components[0]];
  if (!creator) {
    throw new RangeError(`'${id}' doesn't have a valid creation function`);
  }

  return creator(components);
};


/**
 * Possible job priorities.
 */
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
  },

  valid(p) {
    return p >= Job.Priority.CRITICAL && p <= Job.Priority.IGNORE;
  }
};


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
 * Assign a new job to the worker.
 * Workers can have multiple jobs.
 * @param {Job} job the new job
 */
Creep.prototype.assignJob = function assignJob(job) {
  if (!(job instanceof Job)) {
    throw new TypeError(`Tried to assign a non-job to ${u.name(this)}`);
  }
  if (!this.memory.jobs) {
    this.memory.jobs = [];
  }
  this.memory.jobs.push(job.id());
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


module.exports = Job;
