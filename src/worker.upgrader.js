/*
 * Upgrader logic
 */

var Upgrader = {
    
    
    OPERATION: 'upgrading',

    
    ERROR: {
      NONE: 0,
      NO_ENERGY: -1,
      IS_SPAWNING: -2,
      UPGRADE_FAILED: -3
    },
    
    
    /**
     * Start/Continue the worker upgrading the controller.
     * @param worker the worker to order around
     * @return the result of the operation
     */
    work: function(worker) {
        
        if (worker.spawning) {
            return Upgrader.ERROR.IS_SPAWNING;
        }
        
        if (_.sum(worker.carry) == 0) {
            console.log("worker-" + worker.name + " has no energy to upgrade with...");
            return Upgrader.ERROR.NO_ENERGY;
        }

        var res = worker.upgradeController(worker.room.controller);
        switch (res) {
            case 0: 
                break;
            case ERR_NOT_IN_RANGE:
                worker.moveTo(worker.room.controller);
                break;
            default: 
                console.log("worker-" + worker.name + " failed to upgrade controller (" + res + ")");
                return Upgrader.ERROR.UPGRADE_FAILED;
        }
        
        worker.memory.operation = Upgrader.OPERATION;
        return Upgrader.ERROR.NONE;
    }
};

module.exports = Upgrader;