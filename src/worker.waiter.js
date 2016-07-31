/*
 * Waiter logic
 */
 const u = require('utils');
 const Repairer = require('worker.repairer');
 const Storer = require('worker.storer');
 const Upgrader = require('worker.upgrader');
 const Harvester = require('worker.harvester');
 const Builder = require('worker.builder');
 const Dismantler = require('worker.dismantler');

 const Waiter = {


   OPERATION: 'waiting',


   ERROR: {
     NONE: 0,
     IS_SPAWNING: -1,
   },


  /**
   * Start/Continue the worker waiting.
   * @param worker the worker to order around
   * @return the result of the operation
   */
   work(worker) {
     worker.memory.operation = Waiter.OPERATION;
     worker.memory.site = null;

    // If spawning, ignore...
     if (worker.spawning) {
       return Waiter.ERROR.IS_SPAWNING;
     }

     const room = worker.city.room;

      // If the worker has no energy, harvest
      // First see if the worker needs to harvest more energy
     if ((((_.sum(worker.carry) === 0)
                    || (_.sum(worker.carry) < worker.carryCapacity / 2))
                && (room.energyAvailable > 0))
            && (Harvester.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
        // Ensure enough energy gets stored
     const workers = room.find(FIND_MY_CREEPS, (creep) =>
      creep.memory.role === Worker.ROLE
    );
     if (((workers.length <= 4)
                || (room.energyAvailable < room.energyCapacityAvailable / 2))
            && !worker.memory.stoleEnergy
            && (Storer.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
    // Make sure the controller gets upgraded
     const upgraders = _.filter(workers, (w) =>
      w.memory.operation === Upgrader.OPERATION
    );
     if ((upgraders.length < 2) && (Upgrader.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
    // Ensure stuff gets repaired
     const repairers = _.filter(workers, (w) =>
      w.memory.operation === Repairer.OPERATION
    );
     if ((repairers.length < 3) && (Repairer.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
    // Ensure stuff gets built
     const builders = _.filter(workers, (w) =>
      w.memory.operation === Builder.OPERATION
    );
     if ((builders.length < 3) && (Builder.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

    // Dismantle anything marked so
     if (Dismantler.work(worker) === 0) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
    // Fill up all
     console.log(`${u.name(room)} energyAvailable=${room.energyAvailable}, energyCapacity=${room.energyCapacityAvailable}`);
     if (room.storage) {
       console.log(`${u.name(room)} storageAvailable=${_.sum(room.storage.store)}, storageCapacity=${room.storage.storeCapacity}`);
     }

     if ((room.energyAvailable < room.energyCapacityAvailable
            || (room.storage
                && (_.sum(room.storage.store) < room.storage.storeCapacity)))
          && !worker.memory.stoleEnergy
          && (Storer.work(worker) === 0)) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
        // Upgrade the controller
     if (Upgrader.work(worker) === 0) {
       return Waiter.ERROR.NONE;
     }

     worker.memory.site = null;
        // Harvest more energy
     if (Harvester.work(worker) === 0) {
       return Waiter.ERROR.NONE;
     }

     return Waiter.ERROR.NONE;
   },
 };

 module.exports = Waiter;
