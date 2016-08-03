/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const Job = require('job.all');
const Peon = require('peon');
const u = require('utils');


function prioritize(jobs) {
  return _.sortBy(jobs, (j) => j.priority());
}


function jobOptions(options = null) {
  return _.defaults(options || {}, {
    sendEmail: false,
    numJobs: 10,
    jobType: 'All Jobs',
  });
}

const Boss = class Boss {

  constructor(city) {
    this.city = city;
  }

  audit() {
    // Determine all the construction jobs to be worked
    const constructionJobs = [];
    this.city.constructionSites.forEach((cs) => {
      const maxJobs = Job.Build.maxWorkers(cs);
      for (let instance = 0; instance < maxJobs; ++instance) {
        constructionJobs.push(new Job.Build(cs, instance));
      }
    });
    this.constructionJobs = prioritize(constructionJobs);

    const repairJobs = [];
    this.city.repairableSites.forEach((s) => {
      const maxJobs = Job.Repair.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        repairJobs.push(new Job.Repair(s, instance));
      }
    });
    this.repairJobs = prioritize(repairJobs);

    const harvestJobs = [];
    this.city.sources.forEach((s) => {
      const maxJobs = Job.Harvest.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        harvestJobs.push(new Job.Harvest(s, instance));
      }
    });
    this.harvestJobs = prioritize(harvestJobs);

    const storeJobs = [];
    this.city.energyStorage.forEach((s) => {
      const maxJobs = Job.Store.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        storeJobs.push(new Job.Store(s, instance));
      }
    });
    this.storeJobs = prioritize(storeJobs);

    const upgradeJobs = [];
    const maxJobs = Job.Upgrade.maxWorkers(this.city.controller);
    for (let instance = 0; instance < maxJobs; ++instance) {
      upgradeJobs.push(new Job.Upgrade(this.city.controller, instance));
    }
    this.upgradeJobs = prioritize(upgradeJobs);

    this.allJobs = prioritize(this.upgradeJobs.concat(
          this.storeJobs,
          this.harvestJobs,
          // this.repairJobs,
          this.constructionJobs));

    // Hook up the peons existing jobs...
    this.peons = this.city.citizens.map((c) => new Peon(this, c));
    _.each(this.peons, (p) => {
      if (!p.jobId) {
        return;
      }
      let job = _.find(this.allJobs, (j) => j.id() === p.jobId);
      if (!job) {
        const components = p.jobId.split('-');
        job = new Job(
          components[0],
          Game.getObjectById(components[2]),
          components[1],
          p);
      }
      p.assign(job);
    });

    this.idlePeons = _.filter(this.peons, (p) => p.job === null);
    console.log(`${this.info()} has ${this.idlePeons.length} idle peons`);
  }

  info() {
    return `boss-${this.city.room.name}`;
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
    let jobIndex = 0;
    const idleWorkers = this.idlePeons;
    while (idleWorkers.length > 0 && this.allJobs.length - jobIndex > 0) {
      const job = this.allJobs[jobIndex++];
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
    }

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
};


module.exports = Boss;
