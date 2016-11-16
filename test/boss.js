"use strict";

const assert = require('chai').assert;
const Sinon = require('sinon');
const Boss = require('boss');
const Job = require('job.all');
const Helper = require('./helpers');

const TEST_ROOM_NAME = 'E34S32';

const createRoom = function(name = TEST_ROOM_NAME) {
  const room = new Room();
  room.name = name;
  return room;
}

const createCreep = function(room, cityName, jobId = null) {
  const creep = new Creep();
  creep.room = room;
  creep.memory.cityName = cityName;
  creep.memory.jobId = jobId;
  return creep;
}

describe('A Boss', function() {

  describe('Construction', function() {
    it('should be created with expected defaults', function() {
      const room = createRoom();
      const boss = new Boss(room);
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
      const boss = new Boss(createRoom());
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

      const fixture = function() {
        const room = createRoom();
        Sinon.stub(room, "find", (type, opts) => {
          if (type === FIND_CONSTRUCTION_SITES) {
            return TEST_CONSTRUCTION_SITES;
          }
          return [];
        });
        return new Boss(room);
      }

      it('should only return build jobs', function() {
        const boss = fixture();
        const jobs = boss.constructionJobs;

        _.each(jobs, j => {
          assert(j.type === Job.Build.TYPE,
            `${j.info()} not of type ${Job.Build.TYPE}`);
        });
      });


      it('should return all the construction sites as construction jobs', function() {
        const boss = fixture();
        const jobs = boss.constructionJobs;
        assert(jobs.length === TEST_CONSTRUCTION_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_CONSTRUCTION_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_CONSTRUCTION_SITES[i])),
            `Jobs did not contain construction site[${i}]`);
        }
      });


      it('should cache the construction jobs', function() {
        const boss = fixture();
        const jobs = boss.constructionJobs;
        const jobs2 = boss.constructionJobs;
        assert(jobs === jobs2, "Construction jobs are different on different calls");
      });
    });


    describe('retrieving repair jobs', function() {
      const TEST_REPAIR_SITES = [
        new Structure(),
        new Structure(),
        new Structure()
      ];

      const fixture = function() {
        const room = createRoom();
        Sinon.stub(room, "find", (type, opts) => {
          if (type === FIND_MY_STRUCTURES) {
            return TEST_REPAIR_SITES;
          }
          return [];
        });
        return new Boss(room);
      }

      it('should only return repair jobs', function() {
        const boss = fixture();
        const jobs = boss.repairJobs;
        _.each(jobs, j => {
          assert(j.type === Job.Repair.TYPE,
            `${j.info()} not of type ${Job.Repair.TYPE}`);
        });
      });


      it('should return all the repair sites as repair jobs', function() {
        const boss = fixture();
        const jobs = boss.repairJobs;
        assert(jobs.length === TEST_REPAIR_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_REPAIR_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_REPAIR_SITES[i])),
            `Jobs did not contain repair site[${i}]`);
        }
      });


      it('should cache the repair jobs', function() {
        const boss = fixture();
        const jobs = boss.repairJobs;
        const jobs2 = boss.repairJobs;
        assert(jobs === jobs2, "Repair jobs are different on different calls");
      });
    });


    describe('retrieving harvest jobs', function() {
      const TEST_SITES = [
        new Source(),
        new Source(),
        new Mineral()
      ];

      Sinon.stub(TEST_SITES[2], "isHarvestable", () => {
        return true;
      });

      const fixture = function() {
        const room = createRoom();

        Sinon.stub(room, "find", (type, opts) => {
          let filter = (opts && opts.filter) ? opts.filter : _.identity;
          if (type === FIND_SOURCES) {
            return _.filter(TEST_SITES, s =>
            s instanceof Source && filter(s));
          }
          if (type === FIND_MINERALS) {
            return _.filter(TEST_SITES, s =>
            s instanceof Mineral && filter(s));
          }
          return [];
        });

        return new Boss(room);
      }

      it('should only return harvest jobs', function() {
        const boss = fixture();
        const jobs = boss.harvestJobs;
        _.each(jobs, j => {
          assert(j.type === Job.Harvest.TYPE,
            `${j.info()} not of type ${Job.Harvest.TYPE}`);
        });
      });


      it('should return all the harvest sites as harvest jobs', function() {
        const boss = fixture();
        const jobs = boss.harvestJobs;
        assert(jobs.length === TEST_SITES.length,
          `More or less jobs than there are construction sites (${jobs.length} !== ${TEST_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_SITES[i])),
            `Jobs did not contain harvest site[${i}]`);
        }
      });


      it('should cache the harvest jobs', function() {
        const boss = fixture();
        const jobs = boss.harvestJobs;
        const jobs2 = boss.harvestJobs;
        assert(jobs === jobs2, "Harvest jobs are different on different calls");
      });
    });


    describe('retrieving pickup jobs', function() {
      const TEST_PICKUP_SITES = [
        Helper.createPickupSite(StructureStorage, RESOURCE_ENERGY),
        Helper.createPickupSite(StructureContainer, RESOURCE_OXYGEN),
        Helper.createPickupSite(StructureLink, RESOURCE_HYDROGEN)
      ];
      const TEST_RESOURCE_SITES = [
        Helper.createPickupSite(Resource, RESOURCE_ENERGY),
        Helper.createPickupSite(Resource, RESOURCE_OXYGEN)
      ];
      const TEST_HARVESTER_WORKERS = [
        Helper.createPickupSite(Creep, RESOURCE_ENERGY),
        Helper.createPickupSite(Creep, RESOURCE_HYDROGEN)
      ];
      const TEST_ALL_SITES = TEST_PICKUP_SITES
        .concat(TEST_RESOURCE_SITES)
        .concat(TEST_HARVESTER_WORKERS);

      const fixture = function() {
        const room = createRoom();
        _.each(TEST_ALL_SITES, s => s.room = room);
        Sinon.stub(room, "find", (type, filter) => {
          switch (type) {
            case FIND_DROPPED_RESOURCES:
              return TEST_RESOURCE_SITES;
            case FIND_MY_CREEPS:
              return TEST_HARVESTER_WORKERS;
            case FIND_STRUCTURES:
            case FIND_MY_STRUCTURES:
              return TEST_PICKUP_SITES;
            default:
              break;
          }
          return [];
        });

        return new Boss(room);
      }

      it('should only return pickup jobs', function() {
        const boss = fixture();
        const jobs = boss.pickupJobs;

        _.each(jobs, j => {
          assert(j.type === Job.Pickup.TYPE,
            `${j.info()} not of type ${Job.Pickup.TYPE}`);
        });
      });


      it('should return expected sites as pickup jobs', function() {
        const boss = fixture();
        const jobs = boss.pickupJobs;
        assert(jobs.length === TEST_ALL_SITES.length,
          `More or less jobs than there are pickup sites (${jobs.length} !== ${TEST_ALL_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_ALL_SITES[i])),
            `Jobs did not contain pickup site[${i}]`);
        }
      });


      it('should cache the pickup jobs', function() {
        const boss = fixture();
        const jobs = boss.pickupJobs;
        const jobs2 = boss.pickupJobs;
        assert(jobs === jobs2, "Construction jobs are different on different calls");
      });
    });


    describe('retrieving storing jobs', function() {
      const TEST_STORAGE_SITES = [
        new StructureExtension(),
        new StructureSpawn(),
        new StructureContainer(),
        new StructureLink(),
        new StructureStorage()
      ];

      const TEST_STORAGE_CREEPS = [
        new Creep(),
        new Creep()
      ];

      const TEST_ALL_SITES = TEST_STORAGE_SITES.concat(TEST_STORAGE_CREEPS);
      _.each(TEST_ALL_SITES, s => Sinon.stub(s, "isStorable", () => true));

      const fixture = function() {
        const room = createRoom();

        Sinon.stub(room, "find", (type, opts) => {
          let filter = (opts && opts.filter) ? opts.filter : _.identity;
          if (type === FIND_MY_STRUCTURES) {
            return _.filter(TEST_STORAGE_SITES, filter);
          } else if (type === FIND_MY_CREEPS) {
            return _.filter(TEST_STORAGE_CREEPS, filter);
          }
          return [];
        });

        return new Boss(room);
      }

      it('should only return storage jobs', function() {
        const boss = fixture();
        const jobs = boss.storeJobs;
        _.each(jobs, j => {
          assert(j.type === Job.Store.TYPE,
            `${j.info()} not of type ${Job.Store.TYPE}`);
        });
      });


      it('should return all the storage sites as storage jobs', function() {
        const boss = fixture();
        const jobs = boss.storeJobs;
        assert(jobs.length === TEST_ALL_SITES.length,
          `More or less jobs than there are storage sites (${jobs.length} !== ${TEST_ALL_SITES.length})`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === TEST_ALL_SITES[i])),
            `Jobs did not contain storage site[${i}]`);
        }
      });


      it('should cache the storage jobs', function() {
        const boss = fixture();
        const jobs = boss.storeJobs;
        const jobs2 = boss.storeJobs;
        assert(jobs === jobs2, "Storage jobs are different on different calls");
      });
    });


    describe('retrieving upgrade jobs', function() {

      const fixture = function() {
        const room = createRoom();
        room.controller = new StructureController();

        Sinon.stub(room, "find", (type, opts) => {
          let filter = (opts && opts.filter) ? opts.filter : _.identity;
          if (type === FIND_MY_STRUCTURES) {
            return _.filter(TEST_STORAGE_SITES, filter);
          } else if (type === FIND_MY_CREEPS) {
            return _.filter(TEST_STORAGE_CREEPS, filter);
          }
          return [];
        });

        return new Boss(room);
      }


      it('should only return upgrade jobs', function() {
        const boss = fixture();
        const jobs = boss.upgradeJobs;
        _.each(jobs, j => {
          assert(j.type === Job.Upgrade.TYPE,
            `${j.info()} not of type ${Job.Upgrade.TYPE}`);
        });
      });


      it('should return all the upgrade sites as upgrade jobs', function() {
        const boss = fixture();
        const jobs = boss.upgradeJobs;
        assert(jobs.length === 1,
          `There should always be one upgrade job (${jobs.length} !== 1)`);
        for (let i = 0; i < jobs.length; ++i) {
          assert(Boolean(_.find(jobs, j => j.site === boss.room.controller),
            `Jobs did not contain upgrade site[${i}]`));
        }
      });


      it('should cache the upgrade jobs', function() {
        const boss = fixture();
        const jobs = boss.upgradeJobs;
        const jobs2 = boss.upgradeJobs;
        assert(jobs === jobs2, "Upgrade jobs are different on different calls");
      });
    });

    describe('retrieving workers', function() {

      const fixture = function() {
        const room = createRoom(TEST_ROOM_NAME);
        const TEST_CREEPS = [
            createCreep(room, TEST_ROOM_NAME),
            createCreep(room, 'xxxx'),
            createCreep(room, TEST_ROOM_NAME),
            createCreep(room, 'W1N1'),
            createCreep(room, 'E1S1'),
          ];
        Game.creeps = TEST_CREEPS;
        return new Boss(room);
      }

      it('all workers should have the same room as the boss', function() {
        const boss = fixture();
        const workers = boss.workers;
        assert(workers.length === 2, `Unexpected number of workers (${workers.length} !== 2)`);
        _.each(workers, w => assert(w.memory.cityName === boss.room.name));
      });

      it('should cache the wokers', function() {
        const boss = fixture();
        const workers = boss.workers;
        const workers2 = boss.workers;
        assert(workers === workers2, "Workers are different on different calls");
      });

      after(function() {
        Game.creeps = null;
      });
    });
  });
});
