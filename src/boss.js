/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const Job = require('job.all');
const Peon = require('peon');
const u = require('utils');


Creep.prototype.workRoom = function workRoom() {
  return this.memory.transferCity ?
    Game.rooms[this.memory.transferCity] : this.city.room;
};

function prioritize(jobs) {
  return _.sortBy(jobs, j => j.priority);
}


function jobOptions(options = null) {
  return _.defaults(options || {}, {
    sendEmail: false,
    numJobs: 10,
    jobType: 'All Jobs'
  });
}

function buildPriority(cs) {
  return Job.Priority.NORMAL;
}

const Boss = class Boss {

  constructor(room) {
    if (!room) {
      throw new RangeError(`Room for boss cannot be undefined/null`);
    }
    if (!(room instanceof Room)) {
      throw new TypeError('room must be a Room');
    }
    if (room.boss) {
      // The boss of the room should not have been set yet!
      // We only allow one boss per room.
      throw new Error(`${u.name(room)} already has a boss (${this.info()})`);
    }

    // Ok, the room appears ok.
    this.room = room;
    this.cache = new u.Cache();
    room.boss = this;
  }


  info() {
    return `boss-${this.room.name}`;
  }


  get constructionJobs() {
    return this.cache.getValue('constructionJobs', () => {
      const jobs = [];
      const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
      _.each(constructionSites, cs => {
        jobs.push(new Job.Build(cs, buildPriority(cs)));
      });
      return prioritize(jobs);
    });
  }

  get repairJobs() {
    return this.cache.getValue('repairJobs', () => {
      const jobs = [];
      _.each(this.city.repairableSites, s => {
        const maxJobs = Job.Repair.maxWorkers(s);
        for (let instance = 0; instance < maxJobs; ++instance) {
          jobs.push(new Job.Repair(s, instance));
        }
      });
      return prioritize(jobs);
    });
  }

  get harvestJobs() {
    return this.cache.getValue('harvestJobs', () => {
      const jobs = [];
      this.city.sources.forEach(s => {
        const maxJobs = Job.Harvest.maxWorkers(s);
        for (let instance = 0; instance < maxJobs; ++instance) {
          jobs.push(new Job.Harvest(s, instance));
        }
      });
      return prioritize(jobs);
    });
  }

  get storeJobs() {
    return this.cache.getValue('harvestJobs', () => {
      const jobs = [];
      this.city.energyStorage.forEach(s => {
        const maxJobs = Job.Store.maxWorkers(s);
        for (let instance = 0; instance < maxJobs; ++instance) {
          jobs.push(new Job.Store(s, instance));
        }
      });
      return prioritize(jobs);
    });
  }

  get upgradeJobs() {
    return this.cache.getValue('upgradeJobs', () => {
      const workers = this.workers;
      const jobs = [];
      const maxJobs = Job.Upgrade.maxWorkers(this.city.controller);
      for (let instance = 0; instance < maxJobs; ++instance) {
        const job = new Job.Upgrade(this.city.controller, instance);
        jobs.push(job);
      }
      return prioritize(jobs);
    });
  }

  get allJobs() {
    return this.cache.getValue('allJobs', () => {
      const jobs = this.upgradeJobs.concat(
          this.storeJobs,
          this.harvestJobs,
          // this.repairJobs,
          // this.buildJobs,
          this.constructionJobs);

      // Find jobs that are already being worked...
      const workers = this.workers;
      _.each(workers, w => {
        const jobId = w.memory.jobId;
        if (!jobId) {
          return;
        }

        let job = _.find(jobs, j => j.id() === jobId);
        if (job) {
          // Ok, this worker is is performing the job - update the reference
          job.assign(w);
        } else {
          // No job exists that matches the workers... nuke the workers job
          w.memory.jobId = null;
        }
      });

      prioritize(jobs);
    });
  }

  get workers() {
    return this.cache.getValue('workers', () => {
      const workers = _.map(
        _.filter(
          Object.keys(Game.creeps),
          k =>
            (Game.creeps[k].memory.city === this.room.name &&
              !Game.creeps[k].memory.transferCity) ||
                (Game.creeps[k].memory.transferCity === this.room.name)),
        k => {
          const c = Game.creeps[k];
          if (c.memory.transferCity) {
            if (c.room.name === c.memory.transferCity) {
              console.log(`${u.name(c)} is working in transfer location room=${c.room.name})`);
            } else {
              console.log(`${u.name(c)} is in the wrong room (city=${this.room.name}, room=${c.room.name}, transferRoom=${c.memory.transferCity})`);
            }
          }
          return c;
        });

      return workers;
    });
  }

  get peons() {
    return this.cache.getValue('peons', () => {
      const peons = _.map(
        _.filter(Object.keys(Game.creeps),
          k =>
            (Game.creeps[k].memory.city === this.room.name &&
              !Game.creeps[k].memory.transferCity) ||
                (Game.creeps[k].memory.transferCity === this.room.name)),
        k => {
          const c = Game.creeps[k];
          c.city = this;
          if (c.room !== c.city.room) {
            if (c.room.name !== c.memory.transferCity) {
              console.log(`${u.name(c)} is in the wrong room (city=${this.room.name}, room=${c.room.name}, transferRoom=${c.memory.transferCity})`);
            } else {
              console.log(`${u.name(c)} is working in transfer location room=${c.room.name})`);
            }
          }
          return new Peon(this.city, c);
        });

      _.each(peons, p => {
        if (!p.jobId) {
          return;
        }
        let job = _.find(this.allJobs, j => j.id() === p.jobId);
        if (!job) {
          const components = p.jobId.split('-');
          console.log(`components: ${components}`);
          const type = components[0];
          const instance = Number(components[1]);
          const site = Game.getObjectById(components[2]);
          if (site != null) {
            job = new Job(type, site, instance, p);
          }
        }
        p.assign(job);
      });

      return peons;
    });
  }

  get idlePeons() {
    return this.cache.getValue('idlePeons', () =>
      _.filter(this.peons, p => p.job === null));
  }


  audit() {
    // Determine all the construction jobs to be worked
    console.log(`${this.info()} has ${this.peons.length} peons to work with.`);
    console.log(`${this.info()} has ${this.idlePeons.length} idle peons`);
  }


  /**
   * Report job information based on the options provided.
   * @param options the options to modify the report
   */
  jobReport(options = null) {
    const opts = jobOptions(options);
    const jobs = this[opts.jobType] || this.allJobs;

    console.log(`Formatting job report [sendEmail=${opts.sendEmail}, numJobs=${opts.numJobs}, jobType=${opts.jobType}]`);
    let report = `Job Report for ${this.info()} (${opts.jobType})\n`;

    for (let peonIdx = 0; peonIdx < this.peons.length; ++peonIdx) {
      const peon = this.peons[peonIdx];
      if (!peon.job) continue;
      report += `${peon.info()} is working ${peon.job.info()}\n`;
    }

    report += 'Jobs available:\n';
    const numJobs = Math.min(opts.numJobs, jobs.length);
    for (let j = 0; j < numJobs; ++j) {
      const job = jobs[j];
      report += `${j}: ${job.info()}\n`;
    }

    if (opts.sendEmail) {
      Game.notify(report);
    }

    console.log(report);
  }


  /**
   * Get the boss to assign jobs to the peons.
   */
  run() {
    // Allocate jobs to workers
    const idleWorkers = this.idlePeons;
    _.each(this.allJobs, job => {
      if (idleWorkers.length === 0) {
        return;
      }

      // Find best peon for the job
      let efficiency = 0.0;
      let bestIdx = 0;
      const worker = _.reduce(idleWorkers, (bestPeon, peon, idx) => {
        if (peon.job) {
          return bestPeon;
        }
        const efficiency2 = peon.efficiency(job);
        if (efficiency2 > efficiency) {
          efficiency = efficiency2;
          bestIdx = idx;
          return peon;
        }
        return bestPeon;
      }, null);
      if (worker) {
        job.assign(worker);
        worker.assign(job);
        idleWorkers.splice(bestIdx, 1);
      } else {
        // console.log(`Weird - no peon can work ${job.info()}`);
      }
    });

    console.log(`${this.info()} has ${this.idlePeons.length} idle peons after assigning jobs.`);
  }
};


/**
 * Monkey patch the base game classes to provide easier access to important
 * functionality.
 */
Boss.monkeyPatch = function monkeyPatch() {
  Game.report.job = function jobReport(roomName, options = null) {
    const room = Game.rooms[roomName];
    if (!room) {
      console.log(`Can't generate job report - unknown room ${roomName}`);
      return;
    }

    const city = room.city;
    if (!city) {
      console.log(`Can't generate job report - no city for ${u.name(room)}`);
      return;
    }

    city.boss.jobReport(options);
  };

  Game.cmd.transferWorker = function transferWorker(fromRoomName, toRoomName) {
    const fromRoom = Game.rooms[fromRoomName];
    const toRoom = Game.rooms[toRoomName];
    if (!fromRoom || !toRoom) {
      console.log('Invalid rooms specified for transfer');
      return;
    }

    const peon = fromRoom.city.boss.peons[0];
    peon.creep.memory.transferCity = toRoom.name;
    console.log(`Transfering ${peon.info()} to ${toRoom.name} (city=${peon.creep.memory.city}, transferCity=${peon.creep.memory.transferCity})`);
  };
};


module.exports = Boss;
