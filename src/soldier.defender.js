/*
 * Defender logic
 */

var Defender = {
    
    
    OPERATION: 'defending',

    
    ERROR: {
      NONE: 0,
      NO_ENERGY: -1,
      IS_SPAWNING: -2,
      NO_SOURCES: -3,
      HARVESTING_FAILED: -4
    },
    
    
    /**
     * Finds the sources in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of energy sources
     */
    find_civilians(room) {
        return _.sortBy(room.find(FIND_SOURCES), function(s) {
            return Math.random();
            //return s.energyCapacity - s.energy;
        });
    },
    
    
    /**
     * Start/Continue the worker harvesting at the source.
     * @param worker the worker to order around
     * @param source the source to harvest from.  If null, the workers current source is used, or the best available.
     * @return the result of the operation
     */
    work: function(worker, source = null) {
        
        if (worker.spawning) {
            return Harvester.ERROR.IS_SPAWNING;
        }
        
        if (worker.carry.energy == worker.carryCapacity) {
            console.log("worker-" + worker.name + " already has maximum energy!");
            return Harvester.ERROR.NO_ENERGY;
        }
        
        if (source == null && worker.memory.site == null) {
            var sources = Harvester.find_sources(worker.room);
            if (sources.length == 0) {
                console.log("worker-" + worker.name + " found no sources to harvest...");
                return Harvester.ERROR.NO_SOURCES;
            }

            source = sources[0];
            console.log("worker-" + worker.name + " is about to harvest from source-" + source.id);
            worker.memory.site = source.id;
        }
        else if (worker.memory.site == null) {
            worker.memory.site = source.id;
        }
        else {
            source = Game.getObjectById(worker.memory.site);
        }
        
        var res = worker.harvest(source);
        switch (res) {
            case 0:
                if (worker.carry.energy >= worker.carryCapacity) {
                    console.log("worker-" + worker.name + " is full after harvesting");
                    return Worker.wait(worker);
                }
                break;
            case ERR_NOT_IN_RANGE:
                worker.moveTo(source);
                break;
            default: 
                console.log("worker-" + worker.name + " failed to harvest from source-" + source.id + " (" + res + ")");
                return Harvester.ERROR.HARVESTING_FAILED;
        }
        
        worker.memory.operation = Harvester.OPERATION;
        return Harvester.ERROR.NONE;
    },
};

module.exports = Defender;