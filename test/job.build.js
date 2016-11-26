const assert = require('chai').assert;
const Job = require('job');
const JobBuild = require('job.build');
const Sinon = require('sinon');
const Helpers = require('./helpers.js');


describe('Screep Build Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const TEST_SITE_ID = '12345abcde';

  describe('Construction', function() {
    it('can only build on construction sites', function() {
      assert.throws(() => new JobBuild(new Structure()), TypeError);
      assert.throws(() => new JobBuild(undefined), RangeError);
      assert.throws(() => new JobBuild(null), RangeError);
      assert.doesNotThrow(() => new JobBuild(new ConstructionSite()));
    });

    it('can be constructed from the factory', function() {
      Helpers.stubGetObjectById(TEST_SITE_ID, new ConstructionSite());

      const job = Job.create(`${JobBuild.TYPE}-${TEST_SITE_ID}`);
      assert(job.type === JobBuild.TYPE, "Unexptected type");
      assert(job.site.id === TEST_SITE_ID);

      Helpers.unstubGetObjectById();
    });
    it('cannot be constructed from the factory with bad id', function() {
      assert.throws(() => Job.create(`${JobBuild.TYPE}`), RangeError);
      assert.throws(() => Job.create(`${JobBuild.TYPE}-${TEST_SITE_ID}-extra`), RangeError);
    });
  });

  describe('After Construction', function() {
    const site = new ConstructionSite();
    const job = new JobBuild(site);

    it('is of Build type', () => {
      assert(job.type === JobBuild.TYPE, "Unexpected Job type after construction");
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
        it('should always require energy', function() {
          site.progressTotal = 50;
          const energy = job.energyRequired();
          assert(energy !== 0, "Required energy even though structure not damaged.");
        });
      });
    });
  });
  describe('buildAtSite method', function() {
    function createBuilder(res) {
      const creep = Helpers.createCreep();
      Sinon.stub(creep, "build", (site, opts = {}) => res);
      return creep;
    }

    it ('Successfully builds the site', function() {
      const job = new JobBuild(Helpers.createSite(ConstructionSite));
      const worker = createBuilder(OK);
      const res = job.buildAtSite(worker);
      assert(res, "Failed to build at the site!");
    });
    it ('Moves to site if not close enough', function() {
      const job = new JobBuild(Helpers.createSite(ConstructionSite));
      Sinon.stub(job, 'moveToSite', () => true);
      const worker = createBuilder(ERR_NOT_IN_RANGE);
      const res = job.buildAtSite(worker);
      assert(!res, "Indicated successful repair when it shouldn't have!");
      assert(job.moveToSite.calledOnce, "Worker didn't move to site");
    });
    it ('Throws exception on unexpcted errors', function() {
      const job = new JobBuild(Helpers.createSite(ConstructionSite));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_TIRED)));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_NOT_OWNER)));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_INVALID_TARGET)));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_NOT_ENOUGH_RESOURCES)));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_NO_BODYPART)));
      assert.throws(() => job.buildAtSite(createBuilder(ERR_BUSY)));
    });
  });
  describe("Work method", function() {
    function createBuilder(name, res = OK) {
      const creep = Helpers.createCreep();
      creep.name = name;
      Sinon.stub(creep, "build", (site, opts = {}) => res);
      return creep;
    }
    it("All workers work", function() {
      const job = new JobBuild(Helpers.createSite(ConstructionSite));
      const workers = [
        createBuilder('one'),
        createBuilder('two', ERR_NOT_ENOUGH_RESOURCES),
        createBuilder('three')
      ];
      _.each(workers, w => job.assignWorker(w));

      job.work();
      _.each(workers, w => assert(w.build.calledOnce, `${w.info()} didn't build!`));
    });
  });
});
