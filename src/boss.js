/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const Job = require('job.all');


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
    this.constructionJobs = constructionJobs;

    const repairJobs = [];
    city.repairableSites.forEach((s) => {
      const maxJobs = Job.Repair.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        repairJobs.push(new Job.Repair(s, instance));
      }
    });
    console.log(`${repairJobs.length} repair jobs`);
    this.repairJobs = repairJobs;

    const harvestJobs = [];
    city.sources.forEach((s) => {
      const maxJobs = Job.Harvest.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        harvestJobs.push(new Job.Harvest(s, instance));
      }
    });
    console.log(`${harvestJobs.length} harvest jobs`);
    this.harvestJobs = harvestJobs;

    const storeJobs = [];
    city.energyStorage.forEach((s) => {
      const maxJobs = Job.Store.maxWorkers(s);
      for (let instance = 0; instance < maxJobs; ++instance) {
        storeJobs.push(new Job.Store(s, instance));
      }
    });
    console.log(`${storeJobs.length} storing jobs`);
    this.storeJobs = storeJobs;

    const upgradeJobs = [];
    const maxJobs = Job.Upgrade.maxWorkers(city.controller);
    for (let instance = 0; instance < maxJobs; ++instance) {
      upgradeJobs.push(new Job.Upgrade(city.controller, instance));
    }
  }
};

module.exports = Boss;
