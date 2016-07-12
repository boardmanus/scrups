/*
 * Builder logic
 */

var Builder = {
    
    
    OPERATION: 'building',

    
    ERROR: {
      NONE: 0,
      NO_ENERGY: -1,
      IS_SPAWNING: -2,
      NO_CONSTRUCTION_SITES: -3,
      BUILD_FAILED: -4
    },
    
    
    /**
     * Finds the construction sites in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of construction sites
     */
    find_sites(room) {
        return _.sortBy(room.find(FIND_MY_CONSTRUCTION_SITES), function(s) {
            switch (s.structureType) {
                case STRUCTURE_WALL: return 10;
                case STRUCTURE_TOWER: return 11;
                case STRUCTURE_SPAWN: return 20;
                case STRUCTURE_EXTENSION: return 21;
                case STRUCTURE_RAMPART: return 22;
                case STRUCTURE_STORAGE: return 25;
                case STRUCTURE_ROAD: return 30;
                default: break;
            }
            return 100;
        });
    },
    
    
    /**
     * Start/Continue the worker building at the site.
     * @param worker the worker to order around
     * @param site the site to build at.  If null, the workers current site is used, or the best available.
     * @return the result of the operation
     */
    work: function(worker, site = null) {
        
        if (worker.spawning) {
            return Builder.ERROR.IS_SPAWNING;
        }
        
        if (_.sum(worker.carry) == 0) {
            console.log("worker-" + worker.name + " has no energy to build with");
            return Builder.ERROR.NO_ENERGY;
        }
        
        if (site == null && worker.memory.site == null) {
            var sites = Builder.find_sites(worker.room);
            if (sites.length == 0) {
                console.log("worker-" + worker.name + " found no construction sites to build on...");
                return Builder.ERROR.NO_CONSTRUCTION_SITES;
            }
            site = sites[0];
            console.log("worker-" + worker.name + " about to build at " + site.structureType + "-" + site.id);
            worker.memory.site = site.id;
        }
        else if (worker.memory.site == null) {
            worker.memory.site = site.id;
        }
        else {
            site = Game.getObjectById(worker.memory.site);
            if (site == null) {
                console.log("worker-" + worker.name + " worker site-" + worker.memory.site + " invalid!  Removing...");
                worker.memory.site = null;
                return Builder.ERROR.NO_CONSTRUCTION_SITES;
            }
        }

        var res = worker.build(site);
        switch (res) {
            case 0: 
                break;
            case ERR_NOT_IN_RANGE:
                worker.moveTo(site);
                break;
            default: 
                console.log("worker-" + worker.name + " failed to build on " + site.structureType + "-" + site.id + " (" + res + ")");
                return Builder.ERROR.BUILD_FAILED;
        }
        
        worker.memory.operation = Builder.OPERATION;
        return Builder.ERROR.NONE;
    },
};

module.exports = Builder
