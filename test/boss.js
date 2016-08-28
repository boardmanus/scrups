const assert = require('chai').assert;
const Sinon = require('sinon');
const Boss = require('boss');

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

      Sinon.stub(room, "find", (type, opts) => {
        if (type === FIND_CONSTRUCTION_SITES) {
          return TEST_CONSTRUCTION_SITES;
        }
        return [];
      });

      const jobs = boss.constructionJobs;

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
    });
  });
});
