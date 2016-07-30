/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('worker');
 * mod.thing == 'a thing'; // true
 */
const u = require('utils');
const Builder = require('worker.builder');
const Harvester = require('worker.harvester');
const Upgrader = require('worker.upgrader');
const Storer = require('worker.storer');
const Repairer = require('worker.repairer');
const Waiter = require('worker.waiter');
const Dismantler = require('worker.dismantler');
const Claimer = require('worker.claimer');


/**
 * The cost of worker parts
 */
const COST = {
  MOVE: 50,
  CARRY: 50,
  WORK: 100,
  CLAIM: 600,
};

const MIN_PART_COST = COST.MOVE;
const MIN_COST = COST.MOVE + COST.CARRY + COST.WORK;


Creep.prototype.is_lazy = function isLazy() {
  return this.memory.operation === Waiter.OPERATION;
};

const Worker = {

  ROLE: 'worker',

  create(spawner, attribs = {}) {
    let e = spawner.room.energyAvailable;

    // Ensure there is enough energy to create the worker
    if (e < MIN_COST ||
            (attribs.minEnergy && e < attribs.minEnergy)) {
      console.log(`Spawner doesn\'t have enough energy to create desired worker (energy=${e})`);
      return null;
    }

    // Limit the creation to any specified maximum
    if (attribs.maxEnergy && attribs.maxEnergy < e) {
      e = attribs.maxEnergy;
    }

    // Remove the default body energy from the equation...
    e -= MIN_COST;

    // Keep adding body parts until we run out of energy
    const workerToCarry = 2;
    let body;
    let workerOperation;
    if (attribs.claimer) {
      body = [MOVE, CLAIM];
      workerOperation = Claimer.OPERATION;
    } else {
      body = [MOVE, WORK, CARRY];
      workerOperation = Waiter.OPERATION;
      while (e >= MIN_PART_COST) {
              // First put in the correct ratio of work parts
        for (let j = 0; j < workerToCarry; ++j) {
          if (e >= COST.WORK) {
            body.push(WORK);
            e = e - COST.WORK;
            console.log(`added work - energy=${e}`);
          }
        }

        if (e >= COST.CARRY) {
          body.push(CARRY);
          e = e - COST.CARRY;
          console.log(`added carry - energy=${e}`);
        }

        if (e >= COST.MOVE) {
          body.push(MOVE);
          e = e - COST.MOVE;
          console.log(`added move - energy=${e}`);
        }
      }
    }

    const worker = spawner.createCreep(body, null, {
      role: Worker.ROLE,
      operation: workerOperation,
    });
    if (!_.isString(worker)) {
      console.log(`Failed to spawn new worker with body ${body}`);
      return null;
    }

    console.log(`Spawned ${u.name(worker)} with body ${body}`);
    return Game.creeps[worker];
  },

  bestSpawnCost(city) {
    let minCost = MIN_COST;
    let maxCost = Math.min(city.room.energyCapacity, 4 * MIN_COST);

    if (city.citizens.length < 3) {
      maxCost = minCost;
    } else if (city.citizens.length < 5) {
      maxCost = Math.max(maxCost / 3, 2 * minCost);
    } else if (city.citizens.length < 7) {
      minCost = Math.min(2 * MIN_COST, maxCost);
      maxCost = Math.max(maxCost / 2, minCost);
    } else {
      minCost = Math.min(3 * MIN_COST, maxCost);
    }

    return { minEnergy: minCost, maxEnergy: maxCost };
  },

  wait(worker) {
    Waiter.work(worker);
    return worker;
  },

  claim(worker, controller = null) {
    if (Claimer.work(worker, controller) !== Claimer.ERROR.NONE) {
      console.log(`${u.name(worker)} failed to claim!`);
    }

    return worker;
  },

  harvest(worker, source = null) {
    if (Harvester.work(worker, source) !== Harvester.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  store(worker, site = null) {
    if (Storer.work(worker, site) !== Storer.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  upgrade(worker) {
    if (Upgrader.work(worker) !== Upgrader.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  build(worker, site = null) {
    if (Builder.work(worker, site) !== Builder.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  repair(worker, site = null) {
    if (Repairer.work(worker, site) !== Repairer.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  dismantle(worker, site = null) {
    if (Dismantler.work(worker, site) !== Repairer.ERROR.NONE) {
      return Worker.wait(worker);
    }

    return worker;
  },

  work(worker) {
    if (worker.memory.operation == null) {
      console.log(`${u.name(worker)} has no operation set...`);
      Waiter.work(worker);
      return worker;
    }

    switch (worker.memory.operation) {
      case Waiter.OPERATION:
        return Worker.wait(worker);
      case Harvester.OPERATION:
        return Worker.harvest(worker);
      case Storer.OPERATION:
        return Worker.store(worker);
      case Upgrader.OPERATION:
        return Worker.upgrade(worker);
      case Builder.OPERATION:
        return Worker.build(worker);
      case Repairer.OPERATION:
        return Worker.repair(worker);
      case Dismantler.OPERATION:
        return Worker.dismantle(worker);
      case Claimer.OPERATION:
        return Worker.claim(worker);
      default:
        break;
    }

    return worker;
  },
};

module.exports = Worker;
