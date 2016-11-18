const assert = require('chai').assert;
const Sinon = require('sinon');
const Job = require('job');
const JobPickup = require('job.pickup');
const JobHarvest = require('job.harvest');
const Helpers = require('./helpers');


describe('Screep Pickup Job', () => {
  // Test parameters...
  const TEST_PRIORITY = Job.Priority.NORMAL;
  const TEST_SITE_ID = "abcde";

  describe('Construction', function() {
    it('can only pickup from expected sites', function() {
      assert.throws(() => new JobPickup(new ConstructionSite()), TypeError);
      assert.throws(() => new JobPickup(new Structure()), TypeError);
      assert.throws(() => new JobPickup(undefined), RangeError);
      assert.throws(() => new JobPickup(null), RangeError);
      assert.doesNotThrow(() => new JobPickup(Helpers.createPickupSite(StructureContainer, RESOURCE_ENERGY)));
      assert.doesNotThrow(() => new JobPickup(Helpers.createPickupSite(StructureStorage, RESOURCE_ENERGY)));
      assert.doesNotThrow(() => new JobPickup(Helpers.createPickupSite(StructureLink, RESOURCE_ENERGY)));
      assert.doesNotThrow(() => new JobPickup(Helpers.createPickupSite(Creep, RESOURCE_ENERGY)));
      assert.doesNotThrow(() => new JobPickup(Helpers.createPickupSite(Resource, RESOURCE_ENERGY)));
    });


    it('can be constructed from the factory', function() {
      const res = Helpers.createPickupSite(Resource, RESOURCE_HYDROGEN);
      Helpers.stubGetObjectById(TEST_SITE_ID, res);

      const job = Job.create(`${JobPickup.TYPE}-${TEST_SITE_ID}-${RESOURCE_HYDROGEN}`);
      assert(job.type === JobPickup.TYPE, "Unexptected type");
      assert(job.site.id === TEST_SITE_ID);
      assert(job.resource === RESOURCE_HYDROGEN);

      Helpers.unstubGetObjectById();
    });

    it('cannot be constructed from the factory with bad id', function() {
      assert.throws(() => Job.create(`${JobPickup.TYPE}-${TEST_SITE_ID}`), RangeError);
      assert.throws(() => Job.create(`${JobPickup.TYPE}-${TEST_SITE_ID}-${RESOURCE_HYDROGEN}-extra`), RangeError);
    });
  });

  describe('After Construction', function() {

    const fixture = function(site = null) {
      if (!site) {
        site = new StructureContainer();
      }
      site.store[RESOURCE_ENERGY] = 100;
      return new JobPickup(site);
    }

    it('is of Pickup type', () => {
      const job = fixture();
      assert(job.type === JobPickup.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      const site = new StructureContainer();
      const job = fixture(site);
      assert(job.site === site, "Unexpected site after construction");
    });
    it('has the expected priority', function() {
      const job = fixture();
      assert(job.priority() !== Job.Priority.IGNORE, "Unexpected priority after construction");
      assert(Job.Priority.valid(job.priority()), "Invalid priority");
    });

    describe('General methods', function() {
      describe('energyRequired method', function() {
        it('should never require energy', function() {
          const job = fixture();
          const energy = job.energyRequired();
          assert(energy === 0, "Should never require energy");
        });
      });
    });
  });

  describe('Monkey patching', function() {

    describe('hasPickup method', function () {

      it('should always allow pickup of resources', function() {
        const resource = Helpers.createPickupSite(Resource);
        assert(resource.hasPickup(), "Couldn't pick up resource!");
      });

      it('should only allow pickup from containers with resources', function() {
        const container = Helpers.createPickupSite(StructureContainer, [RESOURCE_ENERGY, RESOURCE_OXYGEN]);
        container.store[RESOURCE_HYDROGEN] = 0;
        assert(container.hasPickup(), "Container wasn't empty, but didn't have pickup");
        assert(container.hasPickup(RESOURCE_ENERGY), "Container wasn't empty, but didn't have pickup");
        assert(container.hasPickup(RESOURCE_OXYGEN), "Container wasn't empty, but didn't have pickup");
        assert(!container.hasPickup(RESOURCE_HYDROGEN), "Container was empty, but had pickup");
      });

      it('should only allow pickup from storage with resources', function() {
        const storage = Helpers.createPickupSite(StructureStorage, [RESOURCE_ENERGY, RESOURCE_OXYGEN]);

        assert(storage.hasPickup(), "Container wasn't empty, but didn't have pickup");
        assert(storage.hasPickup(RESOURCE_ENERGY), "Container wasn't empty, but didn't have pickup");
        assert(storage.hasPickup(RESOURCE_OXYGEN), "Container wasn't empty, but didn't have pickup");
        assert(!storage.hasPickup(RESOURCE_HYDROGEN), "Container was empty, but had pickup");
      });

      it('should only allow pickup from harvester creeps', function() {
        const creep = Helpers.createPickupSite(Creep, [RESOURCE_ENERGY, RESOURCE_OXYGEN]);
        creep.job = null;
        assert(!creep.hasPickup(), "shouldn't be able to pickup from a non-harvester creep");
        assert(!creep.hasPickup(RESOURCE_ENERGY), "shouldn't be able to pickup from a non-harvester creep");
        assert(!creep.hasPickup(RESOURCE_OXYGEN), "shouldn't be able to pickup from a non-harvester creep");


        const harvesterCreep = Helpers.createPickupSite(Creep, [RESOURCE_ENERGY, RESOURCE_OXYGEN]);
        assert(harvesterCreep.hasPickup(), "should be able to pickup from a harvester creep with energy");
        assert(harvesterCreep.hasPickup(RESOURCE_ENERGY), "should be able to pickup from a harvester creep with energy");
        assert(harvesterCreep.hasPickup(RESOURCE_OXYGEN), "should be able to pickup from a harvester creep with energy");
        assert(!harvesterCreep.hasPickup(RESOURCE_HYDROGEN), "shouldn't be able to pickup from a harvester creep without the resource");
      });

      it('should allow pickup if any links in room have resources', function() {
        const links = [
          new StructureLink(),
          new StructureLink(),
          new StructureLink()
        ];
        const room = new Room();
        _.each(links, l => {
          l.room = room;
          l.structureType = STRUCTURE_LINK;
          l.energy = 0;
        });

        const stub = Sinon.stub(Room.prototype, 'find', (type, opts) => {
          let filter = (opts && opts.filter) ? opts.filter : _.identity;
          if (type === FIND_MY_STRUCTURES) {
            return _.filter(links, filter);
          }
          return [];
        });

        assert(!links[0].hasPickup(), "no links had energy, but pickup allowed");
        assert(!links[1].hasPickup(), "no links had energy, but pickup allowed");
        assert(!links[2].hasPickup(), "no links had energy, but pickup allowed");

        links[1].energy = 50;
        assert(links[0].hasPickup(), "a link had energy, but no pickup allowed");
        assert(links[1].hasPickup(), "a link had energy, but no pickup allowed");
        assert(links[2].hasPickup(), "a link had energy, but no pickup allowed");
      });

      it('should never allow pickup from other types of room-object', function() {
        assert.throws(() => new RoomPosition().hasPickup());
        assert(!(new RoomObject()).hasPickup(), "A generic RoomObject should not allow pickup");
        assert(!(new StructureTower()).hasPickup(), "Never allow pickup from a tower");
      });
    });
  });
});
