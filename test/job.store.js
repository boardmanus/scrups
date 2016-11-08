const assert = require('chai').assert;
const Job = require('job');
const JobStore = require('job.store');
const Sinon = require('sinon');
const Helpers = require('./helpers.js');


describe('Screep Store Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const TEST_SITE_ID = '12345abcde';

  describe('Construction', function() {
    it('can only build on construction sites', function() {
      assert.throws(() => new JobStore(new Structure()), TypeError);
      assert.throws(() => new JobStore(undefined), RangeError);
      assert.throws(() => new JobStore(null), RangeError);
      assert.throws(() => new JobStore(new Creep()), TypeError);
      assert.doesNotThrow(() => new JobStore(new StructureExtension()));
      assert.doesNotThrow(() => new JobStore(new StructureSpawn()));
      assert.doesNotThrow(() => new JobStore(new StructureStorage()));
      assert.doesNotThrow(() => new JobStore(new StructureContainer()));
    });

    it('can be constructed from the factory', function() {
      Helpers.stubGetObjectById(TEST_SITE_ID, new StructureExtension());

      const job = Job.create(`${JobStore.TYPE}-${TEST_SITE_ID}`);
      assert(job.type === JobStore.TYPE, "Unexptected type");
      assert(job.site.id === TEST_SITE_ID);

      Helpers.unstubGetObjectById();
    });
  });

  describe('After Construction', function() {

    it('is of Store type', () => {
      const site = new StructureContainer();
      const job = new JobStore(site);
      assert(job.type === JobStore.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      const site = new StructureContainer();
      const job = new JobStore(site);
      assert(job.site === site, "Unexpected site after construction");
    });
    it('has an expected priority', function() {
      const site = new StructureContainer();
      const job = new JobStore(site);
      assert(job.priority() !== Job.Priority.IGNORE, "Unexpected priority after construction");
      assert(Job.Priority.valid(job.priority()), "Invalid priority");
    });

    describe('General methods', function() {
      describe('energyRequired method', function() {
        it('should require energy if site has space', function() {
          const site = new StructureExtension();
          site.energy = 0;
          site.energyCapacity = 100;
          const job = new JobStore(site);
          const energy = job.energyRequired();
          console.log(`energyRequired=${job.energyRequired()}, storableSpace=${job.site.storableSpace()}`);
          assert(energy === job.site.storableSpace(), "Required energy should match the storage space");
        });
      });
    });
  });

  describe('Random', function() {
    it('works', function() {
      const structure = new StructureContainer();
      const res = structure.isStorable();
      assert(res);
    });
  });
});
