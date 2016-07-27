/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const u = require('utils');
const Job = require('job.all');


const Boss = class Boss {

  constructor(city) {
    this.city = city;

    // Query the current crop of creeps to find active jobs.
    const activeJobs = [];
    this.city.creeps.forEach((c) => {
      const job = createJob(c);
      if (job) {
        activeJobs.push(job);
      }
    });

    // Determine all the construction jobs to be worked
    const constructionJobs = [];
    city.constructionSites.forEach((cs) => {
      const maxJobs = Job.Build.maxWorkers(cs);
      for (let instance = 0; instance < maxJobs; ++instance) {
        constructionJobs.push(new Job.Build(cs, instance));
      }
    });

    const repairJobs = [];
    city.repairableSites.forEach((s) => {
      const maxJobs = Job.Repair.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        repairJobs.push(new Job.Repair(s, instance));
      }
    });

    const harvestJobs = [];
    city.harvestSites((s) => {
      const maxJobs = Job.Harvest.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        harvestJobs.push(new Job.Harvest(s, instance));
      }
    });

    const storeJobs = [];
    city.energyStorage.forEach((s) => {
      const maxJobs = Job.Store.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        storeJobs.push(new Job.Store(s, instance));
      }
    });
  }


};

module.exports = Boss;
