const assert = require('chai').assert;
// const sinon = require('sinon');
const Job = require('job');
const JobUpgrade = require('job.upgrade');


describe('Screep Upgrade Job', () => {
    // Test parameters...
    const TEST_PRIORITY = Job.Priority.NORMAL;

    describe('Construction', function() {
        it('can only upgrade a controller', function() {
            assert.throws(() => new JobUpgrade(new Structure(), TEST_PRIORITY), TypeError);
            assert.throws(() => new JobUpgrade(new Creep(), TEST_PRIORITY), TypeError);
            assert.throws(() => new JobUpgrade(0, TEST_PRIORITY), RangeError);
            assert.throws(() => new JobUpgrade(null, TEST_PRIORITY), RangeError);
            assert.doesNotThrow(() => new JobUpgrade(new StructureController(), TEST_PRIORITY));
        });
    });

    describe('After Construction', function() {
        const site = new StructureController();
        const job = new JobUpgrade(site, TEST_PRIORITY);

        it('is of upgrade type', () => {
            assert(job.type === JobUpgrade.TYPE, "Unexpected Job type after construction");
        });
        it('has the expected structure', function() {
            assert(job.site === site, "Unexpected site after construction");
        });
        it('has the expected priority', function() {
            assert(job.priority === TEST_PRIORITY, "Unexpected priority after construction");
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
});
