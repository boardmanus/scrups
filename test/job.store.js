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

      describe('transferToSite method', function() {
        function createStubbedCreep(res, resource = RESOURCE_ENERGY) {
          const creep = Helpers.createCreep(200, resource);
          Sinon.stub(creep, "transfer", (site, opts = {}) => res);
          return creep;
        }
        it('should succeed when the worker can transfer', function() {
          const job = new JobStore(Helpers.createSite(StructureStorage));
          const worker = createStubbedCreep(OK);
          assert(job.transferToSite(worker) === true, "Failed to transfer when things were looking good");
        });
        it('should fail when the site is full', function() {
          const job = new JobStore(Helpers.createSite(StructureStorage));
          const worker = createStubbedCreep(ERR_FULL);
          assert(job.transferToSite(worker) === false, "Succeeded transferring when site was full");
        });
        it ('should not store resources in energy only site', function() {
          const job = new JobStore(Helpers.createSite(StructureExtension));
          const worker = createStubbedCreep(OK, RESOURCE_OXYGEN);
          assert(worker.transfer.callCount === 0, "The transfer method was called, when it shouldn't be");
          assert.throws(() => job.transferToSite(worker), Error);
        });
        it('should move towards site if not in range', function() {
          const job = new JobStore(Helpers.createSite(StructureStorage));
          const worker = createStubbedCreep(ERR_NOT_IN_RANGE);
          const moveTo = Sinon.stub(worker, "moveTo", (site, opts = {}) => OK);
          assert(job.transferToSite(worker) === false, "Succeeded when not in range");
          assert(moveTo.calledOnce, "moveTo not invoked");
        });
        it('should throw exceptions on unexpected results', function() {
          const job = new JobStore(Helpers.createSite(StructureStorage));
          assert.throws(() => job.transferToSite(createStubbedCreep(ERR_INVALID_TARGET)), Error);
          assert.throws(() => job.transferToSite(createStubbedCreep(ERR_NOT_OWNER)), Error);
          assert.throws(() => job.transferToSite(createStubbedCreep(ERR_INVALID_ARGS)), Error);
          assert.throws(() => job.transferToSite(createStubbedCreep(ERR_INVALID_TARGET)), Error);
          assert.throws(() => job.transferToSite(createStubbedCreep(ERR_NOT_ENOUGH_RESOURCES)), Error);
        });
      });

      describe('working the job', function() {
        function createStubbedJob(siteType) {
          const job = new JobStore(Helpers.createSite(siteType));
          Sinon.stub(job, "transferToSite", (worker) => true);
          return job;
        }
        it ('should store all worker resources in good conditions', function() {
          const job = createStubbedJob(StructureStorage);
          job.assignWorker(Helpers.createCreep(200, RESOURCE_ENERGY));
          job.assignWorker(Helpers.createCreep(100, RESOURCE_OXYGEN));
          job.work();
          assert(job.transferToSite.calledTwice, "Resources not stored");
        });
        it ('should store energy in energy only site', function() {
          const job = createStubbedJob(StructureExtension);
          job.assignWorker(Helpers.createCreep(200, RESOURCE_ENERGY));
          job.work();
          assert(job.transferToSite.calledOnce, "Resources not stored");
        });
        it ('should only store energy in energy only site', function() {
          const job = createStubbedJob(StructureExtension);
          job.assignWorker(Helpers.createCreep(200, [RESOURCE_OXYGEN, RESOURCE_ENERGY]));
          job.work();
          assert(job.transferToSite.calledOnce, "Resources not stored");
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
