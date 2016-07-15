/**
 * A job for a worker to perform...
 */

const u = require('utils');

const Job = class Job {

  constructor(type, site) {
    this.type = type;
    this.site = site;
  }

  get type() {
    return this.type;
  }

  get site() {
    return this.site;
  }

  /**
   * Generate information about the job
   */
  info() {
    return `job-${this.type} @ ${u.name(this.site)}`;
  }
 /**
  * Determines the priority of the job with respect to the game state.
  */
  priority() {
    return Job.Priority.IGNORE;
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
