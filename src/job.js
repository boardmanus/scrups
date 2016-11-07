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
   * @param {Object} site the site of the will take place at
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
   * @return {number} priority of the job
   */
  priority() {
    return Job.Priority.IDLE;
  }

  /**
   * Generate information about the job
   * @return {string} an info string representing the job
   */
  info() {
    return `job-${this.type}[${this.priority}]@${u.name(this.site)}`;
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
  if (!components instanceof Array) {
    throw new RangeError("Couldn't split id into components");
  }

  const creator = Job.Factory[components[0]];
  if (creator === null) {
    throw new RangeError(`'${id}' doesn't have a valid creation function`);
  }

  return creator(components);
};


/**
 * Possible job priorities.
 * @type {{CRITICAL: number, HIGH: number, NORMAL: number, LOW: number, IDLE: number, IGNORE: number, lower: ((p)), higher: ((p))}}
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
  this.memory.jobs.push(job);
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
