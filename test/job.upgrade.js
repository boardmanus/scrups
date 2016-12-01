const assert = require('chai').assert;
const Job = require('job');
const JobUpgrade = require('job.upgrade');
const Helpers = require('./helpers');
const Sinon = require('sinon');

describe('Screep Upgrade Job', () => {
    // Test parameters...
    const TEST_SITE_ID = '12345'

    describe('Construction', function() {
        it('can only upgrade a controller', function() {
            assert.throws(() => new JobUpgrade(new Structure()), TypeError);
            assert.throws(() => new JobUpgrade(new Creep()), TypeError);
            assert.throws(() => new JobUpgrade(0), RangeError);
            assert.throws(() => new JobUpgrade(null), RangeError);
            assert.doesNotThrow(() => new JobUpgrade(new StructureController()));
        });
        it('can be constructed from the factory', function() {
          Helpers.stubGetObjectById(TEST_SITE_ID, new StructureController());

          const job = Job.create(`${JobUpgrade.TYPE}-${TEST_SITE_ID}`);
          assert(job.type === JobUpgrade.TYPE, "Unexptected type");
          assert(job.site.id === TEST_SITE_ID);

          Helpers.unstubGetObjectById();
        });
        it('cannot be constructed from the factory with bad id', function() {
          assert.throws(() => Job.create(`${JobUpgrade.TYPE}-${TEST_SITE_ID}-extra`), RangeError);
        });
    });

    describe('After Construction', function() {
        const site = new StructureController();
        const job = new JobUpgrade(site);

        it('is of upgrade type', () => {
            assert(job.type === JobUpgrade.TYPE, "Unexpected Job type after construction");
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
                it('always requires energy', function() {
                    const energy = job.energyRequired();
                    assert(energy > 0, "Energy should always be required for upgrade");
                });
            });
            describe('assignWorker method', function() {
                it('only allows creep', function() {
                    assert.doesNotThrow(() => job.assignWorker(new Creep()),
                        'Should be allowed to assign creeps');
                    assert.throws(() => job.assignWorker(new StructureTower()), TypeError);
                    assert.throws(() => job.assignWorker(null), RangeError);
                    assert.throws(() => job.assignWorker(undefined), RangeError);
                    assert.throws(() => job.assignWorker(new Structure), TypeError);
                });
            });
        });
    });

    describe('upgradeSite method', function() {
      function createUpgrader(res) {
        const creep = Helpers.createCreep(100, RESOURCE_ENERGY);
        Sinon.stub(creep, "upgradeController", (controller) => res);
        return creep;
      }

      it ('Successfully upgrades the controller', function() {
        const job = new JobUpgrade(Helpers.createSite(StructureController));
        const worker = createUpgrader(OK);
        const res = job.upgradeSite(worker);
        assert(res, "Failed to repair the site!");
      });
      it ('Moves to site if not close enough', function() {
        const job = new JobUpgrade(Helpers.createSite(StructureController));
        Sinon.stub(job, 'moveToSite', () => true);
        const worker = createUpgrader(ERR_NOT_IN_RANGE);
        const res = job.upgradeSite(worker);
        assert(!res, "Indicated successful upgrade when it shouldn't have!");
        assert(job.moveToSite.calledOnce, "Worker didn't move to site");
      });
      it ('Throws exception on unexpcted errors', function() {
        const job = new JobUpgrade(Helpers.createSite(StructureController));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_TIRED)));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_NOT_OWNER)));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_INVALID_TARGET)));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_NOT_ENOUGH_RESOURCES)));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_NO_BODYPART)));
        assert.throws(() => job.upgradeSite(createUpgrader(ERR_BUSY)));
      });
    });
    describe("Work method", function() {
      function createUpgrader(name, res = OK) {
        const creep = Helpers.createCreep();
        creep.name = name;
        Sinon.stub(creep, "upgradeController", (site, opts = {}) => res);
        return creep;
      }
      it("All workers work", function() {
        const job = new JobUpgrade(Helpers.createSite(StructureController));
        const workers = [
          createUpgrader('one'),
          createUpgrader('two', ERR_NOT_ENOUGH_RESOURCES),
          createUpgrader('three')
        ];
        _.each(workers, w => job.assignWorker(w));

        job.work();
        _.each(workers, w => assert(w.upgradeController.calledOnce, `${w.info()} didn't try to upgrade!`));
      });
    });
});
