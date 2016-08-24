const assert = require('chai').assert;
const sinon = require('sinon');
const JobHarvest = require('job.harvest');


describe('Screep Harvest Job', () => {
  // Test parameters...
  const source = new Source();
  const mineral = new Mineral();
  const job = new JobHarvest(source, 0, null);

  describe('Construction', function() {
    it('can only have a source, mineral or resource site', function() {
      assert.throws(() => new JobHarvest(new Creep(), 0), TypeError);
      assert.throws(() => new JobHarvest(0, 0), RangeError);
      assert.throws(() => new JobHarvest(null, 0), RangeError);
      assert.doesNotThrow(() => new JobHarvest(new Source(), 0), TypeError);
      assert.doesNotThrow(() => new JobHarvest(new Mineral(), 0), TypeError);
      assert.doesNotThrow(() => new JobHarvest(new Resource(), 0), TypeError);
    });
  });
  describe('After Construction', function() {
    it('is of harvest type', () => {
      assert(job.type === JobHarvest.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === source, "Unexpected site after construction");
    });
    it('has the expected instance', function() {
      assert(job.instance === 0, "Unexpected instance after construction");
    });
  });

  describe('Reports the the expected priority', function() {
    it('has lower priority if the site has less resources', function() {
    });
  });

  describe('Mineral patches work correctly', function() {
    it('has the correct number of minerals available', function() {
      const TEST_MINERALS_AVAILABLE = 127;
      mineral.mineralsAvailable = TEST_MINERALS_AVAILABLE;

      const available = mineral.available();
      assert(
        available === TEST_MINERALS_AVAILABLE,
        `Unexpected minerals available (${available} !== ${TEST_MINERALS_AVAILABLE})`);
    });

    it('Produces a good estimate for harvest completion', function() {
      const creep = new Creep();
      creep.body = _.map([WORK, WORK], p => {
        return {type: p};
      });
      mineral.mineralsAvailable = 100;
      mineral.pos = new RoomPosition();
      sinon.stub(mineral.pos, 'look', function(type, x, y) {
        return [creep, creep, creep];
      });

      const numTicks = mineral.harvestCompletion();
      assert(numTicks === 100 / (3 * 2 * 2),
        `Unexpected completion time (${numTicks} !== ${100 / (3 * 2 * 2)})`);
    });
  });

  describe('Source patches work correctly', function() {
    it('has the correct amount of energy available', function() {
      const TEST_ENERGY_AVAILABLE = 127;
      source.energy = TEST_ENERGY_AVAILABLE;

      const available = source.available();
      assert(
        available === TEST_ENERGY_AVAILABLE,
        `Unexpected energy available (${available} !== ${TEST_ENERGY_AVAILABLE})`);
    });

    it('Produces a good estimate for harvest completion', function() {
      const creep = new Creep();
      creep.body = _.map([WORK, WORK, WORK], p => {
        return {type: p};
      });
      source.energy = 100;
      source.pos = new RoomPosition();
      sinon.stub(source.pos, 'look', function(type, x, y) {
        return [creep, creep, creep];
      });

      const numTicks = mineral.harvestCompletion();
      assert(numTicks === 100 / (3 * 2 * 2),
        `Unexpected completion time (${numTicks} !== ${100 / (3 * 3 * 2)})`);
    });
  });
});
