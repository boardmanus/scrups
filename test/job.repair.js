const assert = require('chai').assert;
const Job = require('job');
const JobRepair = require('job.repair');
const Helpers = require('./helpers');


describe('Screep Repair Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const TEST_SITE_ID = '12345'

  describe('Construction', function() {
    it('can only repair structures', function() {
      assert.throws(() => new JobRepair(new Creep(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobRepair(0, TEST_PRIORITY), RangeError);
      assert.throws(() => new JobRepair(null, TEST_PRIORITY), RangeError);
      assert.doesNotThrow(() => new JobRepair(new Structure(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobRepair(new StructureStorage(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobRepair(new StructureContainer(), TEST_PRIORITY));
    });

    it('can be constructed from the factory', function() {
      Helpers.stubGetObjectById(TEST_SITE_ID, new Structure());

      const job = Job.create(`${JobRepair.TYPE}-${TEST_SITE_ID}`);
      assert(job.type === JobRepair.TYPE, "Unexptected type");
      assert(job.site.id === TEST_SITE_ID);

      Helpers.unstubGetObjectById();
    });

    it('cannot be constructed from the factory with bad id', function() {
      assert.throws(() => Job.create(`${JobRepair.TYPE}-${TEST_SITE_ID}-extra`), RangeError);
    });
  });

  describe('After Construction', function() {
    const site = new Structure();
    const job = new JobRepair(site);

    it('is of repair type', () => {
      assert(job.type === JobRepair.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === site, "Unexpected site after construction");
    });
    it('has the expected priority', function() {
      assert(job.priority() !== Job.Priority.IGNORE, "Unexpected priority after construction");
      assert(Job.Priority.valid(job.priority()), "Invalid priority");
    });

    describe('General methods', function() {
      describe('energyRequired method', function() {
        it('requires no energy if the site has no damage', function() {
          site.hits = 500;
          site.hitsMax = 500;
          const energy = job.energyRequired();
          assert(energy === 0, "Required energy even though structure not damaged.");
        });
        it('requires energy if the site has damage', function() {
          site.hits = 499;
          site.hitsMax = 500;
          const energy = job.energyRequired();
          assert(energy > 0, "Required energy even though structure not damaged.");
        });
      });
      describe('assignWorker method', function() {
        it('only allows creeps and towers', function() {
          assert.doesNotThrow(() => job.assignWorker(new Creep()),
            'Should be allowed to assign creeps');
          assert.doesNotThrow(() => job.assignWorker(new StructureTower()),
              'Should be allowed to assign towers');
          assert.throws(() => job.assignWorker(null), RangeError);
          assert.throws(() => job.assignWorker(undefined), RangeError);
          assert.throws(() => job.assignWorker(new Structure), TypeError);
        });
      });
    });
  });
});
