const expect = require('chai').expect;
const assert = require('chai').assert;
const Job = require('job');
const u = require('utils');
const Sinon = require('sinon');
const Helpers = require('./helpers');


describe('Screep Job', function() {
  // Test parameters...
  const TEST_TYPE = 'my_job_type';
  const TEST_TYPE2 = 'my_job_type_2';
  const TEST_ROOM = Helpers.createRoom();
  const TEST_SITE = Helpers.createSite(StructureStorage, [], TEST_ROOM);
  const TEST_SITE2 = Helpers.createSite(Source, [], TEST_ROOM);
  const TEST_SITE3 = Helpers.createSite(Resource, [], TEST_ROOM);
  TEST_SITE2.id = 'unique-id';

  describe('Creating a job using the factory', function() {
      it('Should fail if the job type is uknown', function() {
        assert.throws(() => Job.create(`${TEST_TYPE}-12345`));
      });
      it('Should fail if the id is null', function() {
        assert.throws(() => Job.create(null));
      });
      it("Should fail if the id can't be split", function() {
        assert.throws(() => Job.create(TEST_TYPE));
      });
      it('Should succeed if the job type is known', function() {

        Job.Factory[TEST_TYPE] = function(components) {
          return new Job(TEST_TYPE, new Structure());
        };

        const job = Job.create(`${TEST_TYPE}-12345`);
        assert(job !== null, 'Failed to create job');
        assert(job.type === TEST_TYPE, 'Job had wrong type');

        delete Job.Factory[TEST_TYPE];
      });
  });

  describe('After Construction', function() {

    it('has the expected properties', () => {
      const job = new Job(TEST_TYPE, TEST_SITE);
      expect(job.type).to.equal(TEST_TYPE);
      expect(job.site).to.equal(TEST_SITE);
      expect(job.workers.length).to.equal(0);
    });

    it('has an info value with the type and site name', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      const info = job.info();
      expect(info).to.contain(TEST_TYPE);
      expect(info).to.contain(TEST_SITE.info());
    });

    it('has the same key as a job with the same details', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      const otherJob = new Job(TEST_TYPE, TEST_SITE);
      expect(otherJob.key).to.equal(job.key);
    });

    it('has the same key as id', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(job.id() === job.key, 'Unexpected key value');
    });

    it('has a different key to a job with different details', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      let job2 = new Job(TEST_TYPE2, TEST_SITE);
      assert(job.key !== job2.key, "Same key even though different types!");

      job2 = new Job(TEST_TYPE, TEST_SITE2);
      assert(job.key !== job2.key, "Same key even though different sites!");

      job2 = new Job(TEST_TYPE, TEST_SITE);
      assert(job.key === job2.key, "Different key even though same details!");
    });
  });

  describe('Assigning a worker', function() {
    it('has no workers before assignement', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(job.workers.length === 0, 'The job isAssigned without a worker!');
    });
    it('only accepts creeps as worker', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert.doesNotThrow(() => job.assignWorker(new Creep()));
      assert.throws(() => job.assignWorker(new Structure()), TypeError);
      assert.throws(() => job.assignWorker(null), RangeError);
      assert.throws(() => job.assignWorker(undefined), RangeError);
    });
    it('has worker is present after assigning', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      const worker1 = new Creep();
      const worker2 = new Creep();
      const worker3 = new Creep();

      job.assignWorker(worker1);
      job.assignWorker(worker2);
      assert(_.indexOf(job.workers, worker1) >= 0,
        'The worker wasnt recognised after assignment!');
      assert(_.indexOf(job.workers, worker2) >= 0,
        'The worker wasnt recognised after assignment!');
      assert(_.indexOf(job.workers, worker3) === -1,
        'Found an unassigned worker!');
    });
  });

  describe('Overridable method operation', function() {
    it('energy required should always be 0.0', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(job.energyRequired() === 0.0, 'Unexpected energy');
    });
    it('working the job results in an exception', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert.throws(() => job.work(), Error);
    });
  });

  describe('Job Priority', function() {
    it('provides a higher priority when higher is called', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(Job.Priority.higher(Job.Priority.NORMAL) < Job.Priority.NORMAL,
        'Priority not higher!');
    });
    it('provides a lower priority when lower is called', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(Job.Priority.lower(Job.Priority.NORMAL) > Job.Priority.NORMAL,
        'Priority not lower!');
    });
    it('doesn\'t allow a higher priority than Critical', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(
        Job.Priority.higher(Job.Priority.CRITICAL) === Job.Priority.CRITICAL,
        'Allowed a higher value than Critical!');
    });
    it('doesn\'t allow lower priority than Ignore', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert(
        Job.Priority.lower(Job.Priority.IGNORE) === Job.Priority.IGNORE,
        'Allowed a lower priority than Idle!');
    });
  });

  describe('Moving to work site', function() {

    function createStubbedCreep(moveToResult) {
      const creep = Helpers.createCreep();
      Sinon.stub(creep, "moveTo", (site, opts = {}) => {
        return moveToResult;
      });
      return creep;
    }
    it('Reports success if creep moves to site', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      const creep = createStubbedCreep(OK);
      assert(job.moveToSite(creep), "Unsuccessful return when creep moved");
    });
    it('Reports failure if creep is tired', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      const creep = createStubbedCreep(ERR_TIRED);
      assert(!job.moveToSite(creep), "Unsuccessful return when creep moved");
    });
    it('Throw exception if an unexpected error occurred', function() {
      const job = new Job(TEST_TYPE, TEST_SITE);
      assert.throws(() => job.moveToSite(createStubbedCreep(ERR_NOT_OWNER)), Error);
      assert.throws(() => job.moveToSite(createStubbedCreep(ERR_NO_PATH)), Error);
      assert.throws(() => job.moveToSite(createStubbedCreep(ERR_NO_PATH)), Error);
    });
  });

  describe('Creep patching', function() {

    it('should compute the correct weight', function() {
      const creep = new Creep();
      creep.body = _.map(
        [WORK, WORK, CARRY, CARRY, MOVE, ATTACK, RANGED_ATTACK, TOUGH, HEAL, CLAIM],
        p => {
          return {type: p};
        });

      creep.carry[RESOURCE_ENERGY] = 50;

      const weight = creep.weight();
      assert(weight === 8, `Weight ${weight} !== 8`);
    });

    it('should report the correct energy being carried', function() {
      const creep = new Creep();
      const TEST_ENERGY_AMOUNT = 57;
      creep.carry[RESOURCE_ENERGY] = TEST_ENERGY_AMOUNT;
      creep.carry[RESOURCE_OXYGEN] = 23;

      const energy = creep.energy;
      assert(
        energy === TEST_ENERGY_AMOUNT,
        `Energy different to carry (${energy} !== ${TEST_ENERGY_AMOUNT})`);
    });

    it('should have same energy capacity as carry capacity', function() {
      const creep = new Creep();
      const TEST_ENERGY_CAPACITY = 157;
      creep.carryCapacity = TEST_ENERGY_CAPACITY;

      const energyCapacity = creep.energyCapacity;
      assert(
        energyCapacity === TEST_ENERGY_CAPACITY,
        `Energy capacity different to carry capacity (${energyCapacity} !== ${TEST_ENERGY_CAPACITY})`);
    });

    describe('Creep job assignment', function() {
      it('should have no jobs after creation', function() {
        const creep = new Creep();
        assert(creep.memory.jobs === undefined, 'Had a job when initially created');
      });
      it('throws an exception when calling with a non-job', function() {
        const creep = new Creep();
        assert.throws(() => creep.assignJob(8), TypeError);
      });
      it('should accumulate jobs as they are assigned', function() {
        const creep = new Creep();
        const job1 = new Job(TEST_TYPE, TEST_SITE);
        const job2 = new Job(TEST_TYPE2, TEST_SITE2);
        const job3 = new Job(TEST_TYPE, TEST_SITE3);
        creep.assignJob(job1);
        creep.assignJob(job2);

        assert(creep.memory.jobs.length === 2, 'Had unexpected number of jobs assigned');
        assert(_.indexOf(creep.memory.jobs, job1.id()) >= 0, 'Couldnt find assigned job');
        assert(_.indexOf(creep.memory.jobs, job2.id()) >= 0, 'Couldnt find assigned job');
        assert(_.indexOf(creep.memory.jobs, job3.id()) === -1, 'Found an unexpected job');
      });
    });
  });
});
