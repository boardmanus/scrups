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
  TEST_SITE2.id = 'unique-id';
  const TEST_INSTANCE = 0;
  const TEST_INSTANCE2 = 1;
  const TEST_WORKER = null;

  const job = new Job(TEST_TYPE, TEST_SITE, TEST_INSTANCE, TEST_WORKER);

  describe('After Construction', function() {
    it('has the expected properties', () => {
      expect(job.type).to.equal(TEST_TYPE);
      expect(job.site).to.equal(TEST_SITE);
      expect(job.instance).to.equal(TEST_INSTANCE);
      expect(job.worker).to.equal(TEST_WORKER);
    });

    it('has an info value with the type and site name', function() {
      const info = job.info();
      expect(info).to.contain(TEST_TYPE);
      expect(info).to.contain(u.name(TEST_SITE));
    });

    it('has the same key as a job with the same details', function() {
      const otherJob = new Job(TEST_TYPE, TEST_SITE, TEST_INSTANCE, TEST_WORKER);
      expect(otherJob.key).to.equal(job.key);
    });

    it('has a different key to a job with different details', function() {
      let job2 = new Job(TEST_TYPE2, TEST_SITE, TEST_INSTANCE, TEST_WORKER);
      assert(job.key !== job2.key, "Same key even though different types!");

      job2 = new Job(TEST_TYPE, TEST_SITE2, TEST_INSTANCE, TEST_WORKER);
      assert(job.key !== job2.key, "Same key even though different sites!");

      job2 = new Job(TEST_TYPE, TEST_SITE, TEST_INSTANCE2, TEST_WORKER);
      assert(job.key !== job2.key, "Same key even though different instances!");
    });
  });

  describe('Job Priority', function() {
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

  describe('Assigning a worker', function() {
    const worker = new Creep();
    it('is unassigned before a worker has been assigned', function() {
      assert(!job.isAssigned(), 'The job isAssigned without a worker!');
    });
    it('isAssigned after assigning a worker', function() {
      job.assign(worker);
      assert(job.isAssigned(), 'The job is not assigned after assigning a worker!');
    });
    it('is the same worker returned when querying', function() {
      job.assign(worker);
      assert(job.worker === worker, 'The worker is different to that assigned!');
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
  });
});
