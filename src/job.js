/**
 * A job for a worker to perform...
 */

const u = require('./utils');

const Job = class Job {

  /**
   * Constructs a new job to be worked.
   * @param type the type of job
   * @param site the site of the will take place at
   * @param instance the job instance value (integer)
   * @param worker worker assigned to the job (optional)
   */
  constructor(type, site, instance, worker = null) {
    this.type = type;
    this.site = site;
    this.instance = instance;
    this.worker = worker;
  }

  /**
   * Generate information about the job
   */
  info() {
    return `job-${this.type}[${this.priority()}] @ ${u.name(this.site)}`;
  }

 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    return Job.Priority.IGNORE;
  }


  /**
   * Determines the completion ration of the job.
   * @return the completion ratio [0.0, 1.0]
   */
  completionRatio() {
    return 0.0;
  }


  /**
   * Determines the energy required to complete the job.
   * @return the energy required
   */
  energyRequired() {
    return 0.0;
  }


  /**
   * Determines whether the job is complete
   */
  isComplete() {
    return this.completionRatio() === 1.0;
  }


  /**
   * Determines whether the job has been assigned to a worker.
   */
  isAssigned() {
    return this.worker !== null;
  }


  /**
   * Assign a worker to the job.
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
  },
};

module.exports = Job;
