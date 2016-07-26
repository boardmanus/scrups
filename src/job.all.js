const Job = require('./job');

Job.Harvest = require('./job.harvest');
Job.Repair = require('./job.repair');
Job.Store = require('./job.store');
Job.Upgrade = require('./job.upgrade');

module.exports = Job;
