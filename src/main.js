const Worker = require('worker');
const Repairer = require('worker.repairer');
const Storer = require('worker.storer');
const Upgrader = require('worker.upgrader');
const Waiter = require('worker.waiter');
const Harvester = require('worker.harvester');
const Builder = require('worker.builder');
const Dismantler = require('worker.dismantler');
const u = require('utils');

/**
  * Mainloop of the screeps application
  */
module.exports.loop = function mainLoop() {
  for (let i = 0; i < Memory.creeps.length; ++i) {
    if (!Game.creeps[i]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  Object.keys(Game.rooms).forEach((roomName) => {
    const room = Game.rooms[roomName];
    // RoomInfo.init(room);
    const workers = room.find(FIND_MY_CREEPS, {
      filter: (w) => w.memory.role === Worker.ROLE,
    });
    const towers = room.find(FIND_MY_STRUCTURES, { filter: (s) =>
      s.structureType === STRUCTURE_TOWER,
    });
    const spawners = room.find(FIND_MY_SPAWNS);
    const upgraders = workers.filter((w) => w.memory.operation === Upgrader.OPERATION);
    const builders = workers.filter((w) => w.memory.operation === Builder.OPERATION);
    const repairers = workers.filter((w) => w.memory.operation === Repairer.OPERATION);
    const harvesters = workers.filter((w) =>
      w.memory.operation === Harvester.OPERATION
    );
    const storers = workers.filter((w) => w.memory.operation === Storer.OPERATION);
    const waiters = workers.filter((w) => w.memory.operation === Waiter.OPERATION);
    const dismantlers = workers.filter((w) =>
      w.memory.operation === Dismantler.OPERATION
    );
    const enemies = room.find(FIND_HOSTILE_CREEPS);
    const sources = room.find(FIND_SOURCES);
    // const flags = room.find(FIND_FLAGS);

    let highways = [];
    if (room.memory.highways && spawners.length === 0) {
      sources.forEach((source) => {
        highways.push(room.controller.pos.findPathTo(source));
        spawners.forEach((spawner) => {
          highways.push(spawner.pos.findPathTo(source));
        });
      });

      console.log(`Surveyed ${highways.length} highways.`);
      room.memory.highways = highways;

      highways.forEach((highway) => {
        highway.forEach((pos) => {
          const res = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
          if (res !== 0) {
            console.log(`Failed to construct road at ${pos} (err=${res})`);
          }
        });
      });
    } else {
      highways = room.memory.highways;
    }

    spawners.forEach((spawner) => {
      if (workers.length < 10 && !spawner.spawning) {
        const w = Worker.create(spawner, { minEnergy: 3 * room.energyAvailable / 4 });
        if (w) {
          console.log(`Adding new worker ${u.name(w)}`);
        }
      }
    });


    console.log(`Workers: ${upgraders.length} upgraders, ${builders.length} builders, ${repairers.length} repairers, ${harvesters.length} harvesters, ${storers.length} storers, ${dismantlers.length} dismantlers and ${waiters.length} waiters.`);
    towers.forEach((t) => {
      if (t.energy === 0) {
        return;
      }
      if (enemies.length === 0) {
        if (t.energy < t.energyCapacity / 3) {
          return;
        }
        let rs = room.find(FIND_STRUCTURES, {
          filter: (s) =>
            ((s.owner == null) ||
             (s.structureType === STRUCTURE_RAMPART)) && Repairer.should_repair(s),
        });
        rs = _.sortBy(rs, Repairer.repair_weighting);
        console.log(`${u.name(t)} has ${rs.length} repairable structures`);
        if (rs.length > 0) {
          const s = rs[0];
          console.log(`${u.name(t)} repairing ${u.name(s)} (hits=${s.hits})`);
          const res = t.repair(s);
          if (res !== 0) {
            console.log(`${u.name(t)} failed to repair ${u.name(s)} (${res})`);
          }
        }
      } else {
        const enemy = enemies[0];
        console.log(`${u.name(t)} attacking ${u.name(enemy)}`);
        t.attack(enemy);
      }
    });

    workers.forEach((worker) => Worker.work(worker));
  });
};
