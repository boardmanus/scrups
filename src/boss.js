/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const Job = require('job.all');


function prioritize(jobs) {
  return _.sortBy(jobs, (j) => j.priority());
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

  jobReport(options = null) {
    let sendEmail = false;
    let numJobs = 50;
    let jobType = 'All Jobs';
    let jobs = this.allJobs;
    if (options) {
      sendEmail = options.sendEmail || false;
      numJobs = options.numJobs || 50;
      if (options.jobType) {
        jobType = options.jobType;
        jobs = this[options.jobType] || jobs;
      }
    }
    console.log(`Formatting job report [sendEmail=${sendEmail}, numJobs=${numJobs}, jobType=${jobType}]`);
    let report = `Job Report for ${this.info()} (${jobType})\n`;
    for (let j = 0; j < Math.min(numJobs, jobs.length); ++j) {
      const job = jobs[j];
      report += `${j}: ${job.info()}\n`;
    }

    if (sendEmail) {
      Game.notify(report);
    }
    console.log(report);
  }

  run() {
    // Allocate jobs to workers

  }
};

module.exports = Boss;
