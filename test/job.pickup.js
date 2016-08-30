const assert = require('chai').assert;
// const sinon = require('sinon');
const Job = require('job');
const JobPickup = require('job.pickup');


describe('Screep Pickup Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;

  describe('Construction', function() {
    it('can only pickup from expected sites', function() {
      assert.throws(() => new JobPickup(new ConstructionSite(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobPickup(new Structure(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobPickup(undefined, TEST_PRIORITY), RangeError);
      assert.throws(() => new JobPickup(null, TEST_PRIORITY), RangeError);
      assert.doesNotThrow(() => new JobPickup(new StructureContainer(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobPickup(new StructureStorage(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobPickup(new StructureLink(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobPickup(new Creep(), TEST_PRIORITY));
      assert.doesNotThrow(() => new JobPickup(new Resource(), TEST_PRIORITY));
    });
  });

  describe('After Construction', function() {
    const site = new StructureContainer();
    const job = new JobPickup(site, TEST_PRIORITY);

    it('is of Pickup type', () => {
      assert(job.type === JobPickup.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === site, "Unexpected site after construction");
    });
    it('has the expected priority', function() {
      assert(job.priority === TEST_PRIORITY, "Unexpected priority after construction");
    });

    describe('General methods', function() {
      describe('energyRequired method', function() {
        it('should never require energy', function() {
          const energy = job.energyRequired();
          assert(energy === 0, "Should never require energy");
        });
      });
    });
  });

  describe('Monkey patching', function() {

    describe('hasPickup method', function () {

      it('should always allow pickup of resources', function() {
        const resource = new Resource();
        assert(resource.hasPickup(), "Couldn't pick up resource!");
      });

      it('should only allow pickup from contains with resources', function() {
        const container = new StructureContainer();
        assert(!container.hasPickup(), "Container was empty, but had pickup");

        container.store[RESOURCE_ENERGY] = 50;
        container.store[RESOURCE_OXYGEN] = 20;
        assert(container.hasPickup(), "Container wasn't empty, but didn't have pickup");
      });
    });
  });
});
