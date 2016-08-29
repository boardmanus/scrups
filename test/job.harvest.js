const assert = require('chai').assert;
const Sinon = require('Sinon');
const Job = require('job');
const JobHarvest = require('job.harvest');


describe('Screep Harvest Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const source = new Source();
  const mineral = new Mineral();
  const unharvestableMineral = new Mineral();
  const job = new JobHarvest(source, TEST_PRIORITY);

  Sinon.stub(mineral, "isHarvestable", () => true);
  Sinon.stub(unharvestableMineral, "isHarvestable", () => false);

  describe('Construction', function() {
    it('can only have a source or mineral site', function() {
      assert.throws(() => new JobHarvest(new Creep(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobHarvest(new Resource(), TEST_PRIORITY), TypeError);
      assert.throws(() => new JobHarvest(0, TEST_PRIORITY), RangeError);
      assert.throws(() => new JobHarvest(null, TEST_PRIORITY), RangeError);
      assert.doesNotThrow(() => new JobHarvest(source, TEST_PRIORITY));
      assert.doesNotThrow(() => new JobHarvest(mineral, TEST_PRIORITY));
      assert.throws(() => new JobHarvest(unharvestableMineral, TEST_PRIORITY), RangeError);
    });
  });

  describe('After Construction', function() {
    it('is of harvest type', () => {
      assert(job.type === JobHarvest.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === source, "Unexpected site after construction");
    });
    it('has the expected priority', function() {
      assert(job.priority === TEST_PRIORITY, "Unexpected priority after construction");
    });
    it('never requires energy to harvest', function() {
      assert(job.energyRequired() === 0.0, "Harvest job required energy");
    });
  });

  describe('Mineral patches work correctly', function() {
    it('has the correct number of minerals available', function() {
      const TEST_MINERALS_AVAILABLE = 127;
      const TEST_MINERAL_TYPE = RESOURCE_OXYGEN;
      mineral.mineralType = TEST_MINERAL_TYPE;
      mineral.mineralAmount = TEST_MINERALS_AVAILABLE;

      const available = mineral.harvestableResources();
      assert(available.amount === TEST_MINERALS_AVAILABLE,
        `Unexpected minerals available (${available.amount} !== ${TEST_MINERALS_AVAILABLE})`);
        assert(available.type === TEST_MINERAL_TYPE,
          `Unexpected mineral type (${available.type} !== ${TEST_MINERAL_TYPE})`);
    });
    it('reports whether the mineral is harvestable correctly', function() {
      const m1 = new Mineral();
      const m2 = new Mineral();
      m1.pos = new RoomPosition();
      Sinon.stub(m1.pos, "lookFor", function() {
        return [new Structure()];
      });
      m2.pos = new RoomPosition();
      Sinon.stub(m2.pos, "lookFor", function() {
        return [];
      });

      assert(m1.isHarvestable(), "Mineral should be harvestable");
      assert(!m2.isHarvestable(), "Mineral should be harvestable");
    });
  });

  describe('Source patches work correctly', function() {
    it('has the correct amount of energy available', function() {
      const TEST_ENERGY_AVAILABLE = 127;
      source.energy = TEST_ENERGY_AVAILABLE;

      const available = source.harvestableResources();
      assert(
        available.type === RESOURCE_ENERGY,
        `Unexpected resource type on source(${available.type} !== ${RESOURCE_ENERGY})`);
      assert(
        available.amount === TEST_ENERGY_AVAILABLE,
        `Unexpected energy available (${available.amount} !== ${TEST_ENERGY_AVAILABLE})`);
    });

    it('is always harvestable', function() {
      assert(source.isHarvestable(), "Source wasn't harvestable");
    });
  });
});
