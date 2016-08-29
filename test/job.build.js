const assert = require('chai').assert;
// const sinon = require('sinon');
const Job = require('job');
const JobBuild = require('job.build');


describe('Screep Build Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;

  describe('Construction', function() {
    it('can only build on construction sites', function() {
      assert.throws(() => new JobBuild(new Structure(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobBuild(undefined, TEST_PRIORITY), RangeError);
      assert.throws(() => new JobBuild(null, TEST_PRIORITY), RangeError);
      assert.doesNotThrow(() => new JobBuild(new ConstructionSite(), TEST_PRIORITY));
    });
  });

  describe('After Construction', function() {
    const site = new ConstructionSite();
    const job = new JobBuild(site, TEST_PRIORITY);

    it('is of Build type', () => {
      assert(job.type === JobBuild.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === site, "Unexpected site after construction");
    });
    it('has the expected priority', function() {
      assert(job.priority === TEST_PRIORITY, "Unexpected priority after construction");
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
