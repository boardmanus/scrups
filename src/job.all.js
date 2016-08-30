const Job = require('./job');

Job.Build = require('./job.build');
Job.Harvest = require('./job.harvest');
Job.Repair = require('./job.repair');
Job.Pickup = require('./job.pickup');
Job.Store = require('./job.store');
Job.Upgrade = require('./job.upgrade');

module.exports = Job;
