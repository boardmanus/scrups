const Worker = require('worker');
const Repairer = require('worker.repairer');
const Storer = require('worker.storer');
const Upgrader = require('worker.upgrader');
const Waiter = require('worker.waiter');
const Harvester = require('worker.harvester');
const Builder = require('worker.builder');
const Claimer = require('worker.claimer');
const Dismantler = require('worker.dismantler');
const Country = require('country');
const City = require('city');
const Boss = require('boss');
const CivilEngineer = require('civilengineer');
const Peon = require('peon');
const Job = require('job');
const Profiler = require('screeps-profiler');
const u = require('utils');

function updateProfiling(force = false) {
    if (!Memory.control) {
        Memory.control = { profile: false, lastProfile: false };
    }

    // Nothing has changed.
    if (Memory.control.profile === Memory.control.lastProfile) {
        return;
    }
    
    // Enable the profiler if controlled to do so.
    if (Memory.control.profile) {
      /**
       * Enable the profiler to see where we're wasting cpu...
       */
      console.log('!!!!! ENABLING PROFILER !!!!!');
      Profiler.enable();
      Profiler.registerObject(Country, 'Country');
      Profiler.registerObject(City, 'City');
      Profiler.registerObject(Boss, 'Boss');
      Profiler.registerObject(CivilEngineer, 'CivilEngineer');
      Profiler.registerObject(Peon, 'Peon');
      Profiler.registerObject(Job, 'Job');
      Profiler.registerFN(oldlogic);
    } else {
      console.log('!!!!! ENABLING PROFILER !!!!!');
      Profiler.disable();
      Profiler.registerObject(Country, 'Country');
      Profiler.registerObject(City, 'City');
      Profiler.registerObject(Boss, 'Boss');
      Profiler.registerObject(CivilEngineer, 'CivilEngineer');
      Profiler.registerObject(Peon, 'Peon');
      Profiler.registerObject(Job, 'Job');
      Profiler.registerFN(oldlogic);
    }
}

function oldlogic(country) {
  country.cities.forEach(city => {
  // RoomInfo.init(room);
    const upgraders = city.citizens.filter(w =>
      w.memory.operation === Upgrader.OPERATION);

    const claimers = city.citizens.filter(w =>
      w.memory.operation === Claimer.OPERATION);
    const builders = city.citizens.filter(w =>
      w.memory.operation === Builder.OPERATION);
    const repairers = city.citizens.filter(w =>
      w.memory.operation === Repairer.OPERATION);
    const harvesters = city.citizens.filter(w =>
      w.memory.operation === Harvester.OPERATION);
    const storers = city.citizens.filter(w =>
      w.memory.operation === Storer.OPERATION);
    const waiters = city.citizens.filter(w =>
      w.memory.operation === Waiter.OPERATION);
    const dismantlers = city.citizens.filter(w =>
      w.memory.operation === Dismantler.OPERATION);

    city.spawners.forEach(spawner => {
      if (spawner.spawning) {
        return;
      }

      if (claimers.length === 0 &&
        Claimer.have_controller_to_claim()) {
        const w = Worker.create(spawner, {
          claimer: true
        });
        if (w) {
          console.log(`Adding new claimer ${u.name(w)}`);
        } else {
          console.log('Failed to create claimer!');
        }
      }

      if (city.citizens.length < 10 && !spawner.spawning) {
        const params = Worker.bestSpawnCost(city);
        const w = Worker.create(spawner, params);
        if (w) {
          console.log(`Adding new worker ${u.name(w)}`);
        }
      }
    });

    console.log(`${u.name(city.room)} workers: ${claimers.length} claimers, ${upgraders.length} upgraders, ${builders.length} builders, ${repairers.length} repairers, ${harvesters.length} harvesters, ${storers.length} storers, ${dismantlers.length} dismantlers and ${waiters.length} waiters.`);
    city.towers.forEach(t => {
      console.log(`${u.name(t)} has ${t.energy}/${t.energyCapacity} energy available (room has ${city.room.energyAvailable}/${city.room.energyCapacityAvailable}).`);
      if (t.energy === 0) {
        return;
      }
      if (city.enemies.length === 0) {
        if (t.energy < t.energyCapacity / 3) {
          return;
        }
        if (t.energy < t.energyCapacity / 2 &&
            city.room.energyAvailable < city.room.energyCapacityAvailable / 2) {
          return;
        }

        let rs = _.filter(city.repairableSites, Repairer.should_repair);
        rs = _.sortBy(rs, s => Repairer.repair_weighting(t.pos, s));
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

    city.citizens.forEach(worker => Worker.work(worker));
  });
}

function updateProfiling() {
  if (!Memory.control) {
    Memory.control = {profile: false};
  }

    // Enable the profiler if controlled to do so.
  if (Memory.control.profile) {
    /**
     * Enable the profiler to see where we're wasting cpu...
     */
    console.log('!!!!! ENABLING PROFILER !!!!!');
    Profiler.enable();
    Profiler.registerObject(Country, 'Country');
    Profiler.registerObject(City, 'City');
    Profiler.registerObject(Boss, 'Boss');
    Profiler.registerObject(CivilEngineer, 'CivilEngineer');
    Profiler.registerObject(Peon, 'Peon');
    Profiler.registerObject(Job, 'Job');
    Profiler.registerFN(oldlogic);
  }
}

updateProfiling();

/**
  * Mainloop of the screeps application
  */
module.exports.loop = function mainLoop() {
  const startUsed = Game.cpu.getUsed();
  const startLimit = Game.cpu.tickLimit;
  const startBucket = Game.cpu.bucket;
  Country.monkeyPatch();

  // Profiler.wrap(() => {
  Object.keys(Memory.creeps).forEach(name => {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  });

  const country = new Country();
  Game.country = country;
  country.audit();
  country.run();
  oldlogic(country);

  // });
  const endUsed = Game.cpu.getUsed();
  const endLimit = Game.cpu.tickLimit;
  console.log(`CPU: end=${endUsed} - start=${startUsed} = totalUsed=${endUsed - startUsed}`);
  console.log(`CPU: startLimit=${startLimit} - endLimit=${endLimit} = usedLimit=${startLimit - endLimit}`);
};
