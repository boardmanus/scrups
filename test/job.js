const expect = require('chai').expect;
const assert = require('chai').assert;
const Job = require('job');
const u = require('utils');

describe('Screep Job', function() {
  // Test parameters...
  const TEST_TYPE = 'my-job-type';
  const TEST_TYPE2 = 'my-job-type-2';
  const TEST_SITE = new Structure();
  const TEST_SITE2 = new Structure();
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const TEST_PRIORITY2 = Job.Priority.HIGH;
  TEST_SITE2.id = 'unique-id';

  const job = new Job(TEST_TYPE, TEST_SITE);

  describe('After Construction', function() {
    it('has the expected properties', () => {
      expect(job.type).to.equal(TEST_TYPE);
      expect(job.site).to.equal(TEST_SITE);
      expect(job.workers.length).to.equal(0);
    });

    it('has an info value with the type and site name', function() {
      const info = job.info();
      expect(info).to.contain(TEST_TYPE);
      expect(info).to.contain(u.name(TEST_SITE));
    });

    it('has the same key as a job with the same details', function() {
      const otherJob = new Job(TEST_TYPE, TEST_SITE, TEST_PRIORITY);
      expect(otherJob.key).to.equal(job.key);
    });

    it('has the same key as id', function() {
      assert(job.id() === job.key, 'Unexpected key value');
    });

    it('has a different key to a job with different details', function() {
      let job2 = new Job(TEST_TYPE2, TEST_SITE);
      assert(job.key !== job2.key, "Same key even though different types!");

      job2 = new Job(TEST_TYPE, TEST_SITE2);
      assert(job.key !== job2.key, "Same key even though different sites!");

      job2 = new Job(TEST_TYPE, TEST_SITE);
      assert(job.key === job2.key, "Different key even though same details!");
    });
  });

  describe('Assigning a worker', function() {
    it('has no workers before assignement', function() {
      assert(job.workers.length === 0, 'The job isAssigned without a worker!');
    });
    it('only accepts creeps as worker', function() {
      assert.doesNotThrow(() => job.assignWorker(new Creep()));
      assert.throws(() => job.assignWorker(new Structure()), TypeError);
      assert.throws(() => job.assignWorker(null), RangeError);
      assert.throws(() => job.assignWorker(undefined), RangeError);
    });
    it('has worker is present after assigning', function() {
      const worker1 = new Creep();
      const worker2 = new Creep();
      const worker3 = new Creep();

      job.assignWorker(worker1);
      job.assignWorker(worker2);
      assert(_.indexOf(job.workers, worker1) >= 0,
        'The worker wasnt recognised after assignment!');
      assert(_.indexOf(job.workers, worker2) >= 0,
        'The worker wasnt recognised after assignment!');
      assert(_.indexOf(job.workers, worker3) === -1,
        'Found an unassigned worker!');
    });
  });

  describe('Overridable method operation', function() {
    it('energy required should always be 0.0', function() {
      assert(job.energyRequired() === 0.0, 'Unexpected energy');
    });
  });

  describe('Job Priority', function() {
    it('provides a higher priority when higher is called', function() {
      assert(Job.Priority.higher(Job.Priority.NORMAL) < Job.Priority.NORMAL,
        'Priority not higher!');
    });
    it('provides a lower priority when lower is called', function() {
      assert(Job.Priority.lower(Job.Priority.NORMAL) > Job.Priority.NORMAL,
        'Priority not lower!');
    });
    it('doesn\'t allow a higher priority than Critical', function() {
      assert(
        Job.Priority.higher(Job.Priority.CRITICAL) === Job.Priority.CRITICAL,
        'Allowed a higher value than Critical!');
    });
    it('doesn\'t allow lower priority than Ignore', function() {
      assert(
        Job.Priority.lower(Job.Priority.IGNORE) === Job.Priority.IGNORE,
        'Allowed a lower priority than Idle!');
    });
  });

  describe('Creep patching', function() {
    const creep = new Creep();

    it('should compute the correct weight', function() {
      creep.body = _.map(
        [WORK, WORK, CARRY, CARRY, MOVE, ATTACK, RANGED_ATTACK, TOUGH, HEAL, CLAIM],
        p => {
          return {type: p};
        });

      creep.carry[RESOURCE_ENERGY] = 50;

      const weight = creep.weight();
      assert(weight === 8, `Weight ${weight} !== 8`);
    });

    it('should report the correct energy being carried', function() {
      const TEST_ENERGY_AMOUNT = 57;
      creep.carry[RESOURCE_ENERGY] = TEST_ENERGY_AMOUNT;
      creep.carry[RESOURCE_OXYGEN] = 23;

      const energy = creep.energy;
      assert(
        energy === TEST_ENERGY_AMOUNT,
        `Energy different to carry (${energy} !== ${TEST_ENERGY_AMOUNT})`);
    });

    it('should have same energy capacity as carry capacity', function() {
      const TEST_ENERGY_CAPACITY = 157;
      creep.carryCapacity = TEST_ENERGY_CAPACITY;

      const energyCapacity = creep.energyCapacity;
      assert(
        energyCapacity === TEST_ENERGY_CAPACITY,
        `Energy capacity different to carry capacity (${energyCapacity} !== ${TEST_ENERGY_CAPACITY})`);
    });

    describe('Creep job assignment', function() {
      it('should have no jobs after creation', function() {
        assert(creep.memory.jobs === undefined, 'Had a job when initially created');
      });
      it('throws an exception when calling with a non-job', function() {
        assert.throws(() => creep.assignJob(8), TypeError);
      });
      it('should accumulate jobs as they are assigned', function() {
        const job1 = new Job(TEST_TYPE, TEST_SITE, TEST_PRIORITY);
        const job2 = new Job(TEST_TYPE2, TEST_SITE2, TEST_PRIORITY2);
        const job3 = new Job(TEST_TYPE, TEST_SITE2, TEST_PRIORITY2);
        creep.assignJob(job1);
        creep.assignJob(job2);
        assert(creep.memory.jobs.length === 2,
          'Had unexpected number of jobs assigned');
        assert(_.indexOf(creep.memory.jobs, job1) >= 0, 'Couldnt find assigned job');
        assert(_.indexOf(creep.memory.jobs, job2) >= 0, 'Couldnt find assigned job');
        assert(_.indexOf(creep.memory.jobs, job3) === -1, 'Found an unexpected job');
      });
    });
  });
});
