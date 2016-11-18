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
      assert.doesNotThrow(() => new JobStore(new Creep()));
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

    it('cannot be constructed from the factory with bad id', function() {
      assert.throws(() => Job.create(`${JobStore.TYPE}-${TEST_SITE_ID}-extra`), RangeError);
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

  describe('Monky-patching', function() {
    it('isStorable method succeeds where expected', function() {
      assert(!(new Structure()).isStorable());
      assert(!(new StructureWall()).isStorable());
      assert((new StructureContainer()).isStorable());
      assert((new StructureContainer()).isStorable(RESOURCE_HYDROGEN));
      assert((new Creep()).isStorable());
      assert((new Creep()).isStorable(RESOURCE_OXYGEN));
      assert((new StructureTower()).isStorable(RESOURCE_ENERGY));
      assert(!(new StructureTower()).isStorable(RESOURCE_HYDROGEN));
    });

    it('has storableSpace where expected', function() {
      assert((new Structure()).storableSpace() === 0);
      assert(Helpers.createTower(100).storableSpace() === 100);
      assert(Helpers.createTower(100, 50).storableSpace() === 100 - 50);
      assert(Helpers.createCreep(100).storableSpace() === 100);
      assert(Helpers.createCreep(100, 50).storableSpace() === 100 - 50);
    });
  });
});
