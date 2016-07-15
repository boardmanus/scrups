/*
 * Upgrader logic
 */
const u = require('utils');

const Upgrader = {


  OPERATION: 'upgrading',


  ERROR: {
    NONE: 0,
    NO_ENERGY: -1,
    IS_SPAWNING: -2,
    UPGRADE_FAILED: -3,
  },


    /**
     * Start/Continue the worker upgrading the controller.
     * @param worker the worker to order around
     * @return the result of the operation
     */
  work(worker) {
    if (worker.spawning) {
      return Upgrader.ERROR.IS_SPAWNING;
    }

    if (_.sum(worker.carry) === 0) {
      console.log(`${u.name(worker)} has no energy to upgrade with...`);
      return Upgrader.ERROR.NO_ENERGY;
    }

    const res = worker.upgradeController(worker.room.controller);
    switch (res) {
      case 0:
        break;
      case ERR_NOT_IN_RANGE:
        worker.moveTo(worker.room.controller);
        break;
      default:
        console.log(`${u.name(worker)} failed to upgrade controller (${res})`);
        return Upgrader.ERROR.UPGRADE_FAILED;
    }

    worker.memory.operation = Upgrader.OPERATION;
    return Upgrader.ERROR.NONE;
  },
};

module.exports = Upgrader;
