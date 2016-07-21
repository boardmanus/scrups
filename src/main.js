const Worker = require('worker');
const Repairer = require('worker.repairer');
const Storer = require('worker.storer');
const Upgrader = require('worker.upgrader');
const Waiter = require('worker.waiter');
const Harvester = require('worker.harvester');
const Builder = require('worker.builder');
const Dismantler = require('worker.dismantler');
const City = require('city');
const u = require('utils');

/**
  * Mainloop of the screeps application
  */
module.exports.loop = function mainLoop() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      Memory.creeps[name] = null;
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  for (const roomName in Game.rooms) {
    const city = new City(Game.rooms[roomName]);

    // RoomInfo.init(room);
    const upgraders = city.citizens.filter((w) =>
      w.memory.operation === Upgrader.OPERATION
    );
    const builders = city.citizens.filter((w) =>
      w.memory.operation === Builder.OPERATION
    );
    const repairers = city.citizens.filter((w) =>
      w.memory.operation === Repairer.OPERATION
    );
    const harvesters = city.citizens.filter((w) =>
      w.memory.operation === Harvester.OPERATION
    );
    const storers = city.citizens.filter((w) =>
      w.memory.operation === Storer.OPERATION
    );
    const waiters = city.citizens.filter((w) =>
      w.memory.operation === Waiter.OPERATION
    );
    const dismantlers = city.citizens.filter((w) =>
      w.memory.operation === Dismantler.OPERATION
    );

    city.spawners.forEach((spawner) => {
      if (city.citizens.length < 10 && !spawner.spawning) {
        const w = Worker.create(spawner, { minEnergy: 3 * city.room.energyAvailable / 4 });
        if (w) {
          console.log(`Adding new worker ${u.name(w)}`);
        }
      }
    });


    console.log(`Workers: ${upgraders.length} upgraders, ${builders.length} builders, ${repairers.length} repairers, ${harvesters.length} harvesters, ${storers.length} storers, ${dismantlers.length} dismantlers and ${waiters.length} waiters.`);
    city.towers.forEach((t) => {
      console.log(`${u.name(t)} has ${t.energy}/${t.energyCapacity} energy available.`);
      if (t.energy === 0) {
        return;
      }
      if (city.enemies.length === 0) {
        if (t.energy < t.energyCapacity / 3) {
          return;
        }
        let rs = _.filter(city.structures, Repairer.should_repair);
        rs = _.sortBy(rs, (s) => Repairer.repair_weighting(t.pos, s));
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
        const enemy = city.enemies[0];
        console.log(`${u.name(t)} attacking ${u.name(enemy)}`);
        t.attack(enemy);
      }
    });

    city.citizens.forEach((worker) => Worker.work(worker));
  }
};
