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
});
