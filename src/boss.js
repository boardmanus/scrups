/*
 * A boss works out all the jobs that needs doing, and distributes them to
 * creeps
 */
const u = require('utils');


function createJob(worker) {
  const rememberedJob = worker.memory.job;
  if (!rememberedJob) {
    return null;
  }

  const site = Game.getObjectById(rememberedJob.site);
  let job = null;
  switch (rememberedJob.type) {
    case JobHarvest.TYPE:
      job = JobHarvest(site, remeberedJob.harvestRatio);
      break;
  }

  job.assign(worker);
}


const Boss = class Boss {

  constructor(city) {
    this.city = city;
  }

  audit() {
    // Query the current crop of creeps to find active jobs.
    const activeJobs = [];
    this.city.creeps.forEach((c) => {
      const job = createJob(c);
      if (job) {
        activeJobs.push(job);
      }
    });

    let activeJobs = [];
    const rememberedJobs = this.city.room.activeJobs;
    if (rememberedJobs !== null) {
      activeJobs = rememberedJobs.map((j) => createJob(j));
    }
  }


};

module.exports = Boss;
