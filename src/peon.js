/*
 * A base Peon for performing jobs
 */
const u = require('utils');


const Peon = class Peon {

  constructor(creep) {
    this.job = null;
    this.operation = null;
    this.creep = creep;
  }

  efficiency(job) {
    switch (job.type) {
      case
    }
  }
};

Peon.TYPE = 'generic';
Peon.BODY_TYPE = [MOVE, WORK, CARRY];

module.exports = Peon;
