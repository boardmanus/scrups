/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const Job = require('job.all');
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

    console.log('The Boss found:');

    // Determine all the construction jobs to be worked
    const constructionJobs = [];
    city.constructionSites.forEach((cs) => {
      const maxJobs = Job.Build.maxWorkers(cs);
      for (let instance = 0; instance < maxJobs; ++instance) {
        constructionJobs.push(new Job.Build(cs, instance));
      }
    });
    console.log(`${constructionJobs.length} construction jobs`);
    this.constructionJobs = prioritize(constructionJobs);

    const repairJobs = [];
    city.repairableSites.forEach((s) => {
      const maxJobs = Job.Repair.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        repairJobs.push(new Job.Repair(s, instance));
      }
    });
    console.log(`${repairJobs.length} repair jobs`);
    this.repairJobs = prioritize(repairJobs);

    const harvestJobs = [];
    city.sources.forEach((s) => {
      const maxJobs = Job.Harvest.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        harvestJobs.push(new Job.Harvest(s, instance));
      }
    });
    console.log(`${harvestJobs.length} harvest jobs`);
    this.harvestJobs = prioritize(harvestJobs);

    const storeJobs = [];
    city.energyStorage.forEach((s) => {
      const maxJobs = Job.Store.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        storeJobs.push(new Job.Store(s, instance));
      }
    });
    console.log(`${storeJobs.length} storing jobs`);
    this.storeJobs = prioritize(storeJobs);

    const upgradeJobs = [];
    const maxJobs = Job.Upgrade.maxWorkers(city.controller);
    for (let instance = 0; instance < maxJobs; ++instance) {
      upgradeJobs.push(new Job.Upgrade(city.controller, instance));
    }
    console.log(`${upgradeJobs.length} upgrading jobs`);
    this.upgradeJobs = prioritize(upgradeJobs);

    this.allJobs = prioritize(this.upgradeJobs.concat(
          this.storeJobs,
          this.harvestJobs,
          // this.repairJobs,
          this.constructionJobs));

    console.log('Top Jobs:');
    for (let j = 0; j < Math.min(10, this.allJobs.length); ++j) {
      const job = this.allJobs[j];
      console.log(`${j}: ${job.info()}`);
    }
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

  run() {
    // Allocate jobs to workers

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
