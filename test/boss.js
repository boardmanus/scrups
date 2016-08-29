const assert = require('chai').assert;
const Sinon = require('sinon');
const Boss = require('boss');
const Job = require('job.all');

describe('A Boss', function() {
  const TEST_ROOM_NAME = 'E34S32';
  const room = new Room();
  const boss = new Boss(room);

  describe('Construction', function() {
    it('should be created with expected defaults', function() {
      assert(boss.room === room, "City wasn't expected value");
      assert(room.boss === boss, "The boss wasn't assigned to the room");
    });
    it('should throw an exception if the room is invalid', function() {
      assert.throw(() => new Boss(), RangeError);
      assert.throw(() => new Boss(null), RangeError);
      assert.throw(() => new Boss(undefined), RangeError);
      assert.throw(() => new Boss("no"), TypeError);
      assert.throw(() => new Boss(new Creep()), TypeError);
    });
    it('should throw an exception if the room already has a boss', function() {
      assert.throw(() => new Boss(room), Error);
    });
  });

  describe('General methods', function() {
    it('should report appropriate info', function() {
      room.name = TEST_ROOM_NAME;
      const info = boss.info();
      assert(info.includes(TEST_ROOM_NAME),
        `Room name (${TEST_ROOM_NAME}) not in info (${info})`);
    });

    describe('retrieving build jobs', function() {
      const TEST_CONSTRUCTION_SITES = [
        new ConstructionSite(),
        new ConstructionSite(),
        new ConstructionSite()
      ];

      const stub = Sinon.stub(room, "find", (type, opts) => {
        if (type === FIND_CONSTRUCTION_SITES) {
          return TEST_CONSTRUCTION_SITES;
        }
        return [];
      });

      const jobs = boss.constructionJobs;

      it('should only return build jobs', function() {
        _.each(jobs, j => {
          assert(j.type === Job.Build.TYPE,
            `${j.info()} not of type ${Job.Build.TYPE}`);
        });
      });

      it('should return all the construction sites as construction jobs', function() {
        assert(jobs.length === TEST_CONSTRUCTION_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_CONSTRUCTION_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_CONSTRUCTION_SITES[i])),
            `Jobs did not contain construction site[${i}]`);
        }
      });

      it('should cache the construction jobs', function() {
        const jobs2 = boss.constructionJobs;
        assert(jobs === jobs2, "Construction jobs are different on different calls");
      });

      stub.restore();
    });
    describe('retrieving repair jobs', function() {
      const TEST_REPAIR_SITES = [
        new Structure(),
        new Structure(),
        new Structure()
      ];

      const stub = Sinon.stub(room, "find", (type, opts) => {
        if (type === FIND_MY_STRUCTURES) {
          return TEST_REPAIR_SITES;
        }
        return [];
      });

      const jobs = boss.repairJobs;

      it('should only return repair jobs', function() {
        _.each(jobs, j => {
          assert(j.type === Job.Repair.TYPE,
            `${j.info()} not of type ${Job.Repair.TYPE}`);
        });
      });
      it('should return all the repair sites as repair jobs', function() {
        assert(jobs.length === TEST_REPAIR_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_REPAIR_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_REPAIR_SITES[i])),
            `Jobs did not contain repair site[${i}]`);
        }
      });

      it('should cache the repair jobs', function() {
        const jobs2 = boss.repairJobs;
        assert(jobs === jobs2, "Repair jobs are different on different calls");
      });

      stub.restore();
    });
    describe('retrieving harvest jobs', function() {
      const TEST_SITES = [
        new Source(),
        new Source(),
        new Mineral()
      ];

      const stubs = [];
      stubs.push(Sinon.stub(room, "find", (type, opts) => {
        let filter = (opts && opts.filter) ? opts.filter : s => s;
        if (type === FIND_SOURCES) {
          return _.filter(TEST_SITES, s =>
            s instanceof Source && filter(s));
        }
        if (type === FIND_MINERALS) {
          return _.filter(TEST_SITES, s =>
            s instanceof Mineral && filter(s));
        }
        return [];
      }));

      stubs.push(Sinon.stub(Mineral.prototype, "isHarvestable", () => {
        return true;
      }));

      const jobs = boss.harvestJobs;

      it('should only return harvest jobs', function() {
        _.each(jobs, j => {
          assert(j.type === Job.Harvest.TYPE,
            `${j.info()} not of type ${Job.Harvest.TYPE}`);
        });
      });

      it('should return all the harvest sites as harvest jobs', function() {
        assert(jobs.length === TEST_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_SITES[i])),
            `Jobs did not contain harvest site[${i}]`);
        }
      });

      it('should cache the harvest jobs', function() {
        const jobs2 = boss.harvestJobs;
        assert(jobs === jobs2, "Harvest jobs are different on different calls");
      });

      _.each(stubs, s => s.restore());
    });
  });
});
