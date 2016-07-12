/*
 * Repairer logic
 */
var Dismantler = require("worker.dismantler");


var Repairer = {
    
    
    OPERATION: 'repairing',

    
    ERROR: {
      NONE: 0,
      NO_ENERGY: -1,
      IS_SPAWNING: -2,
      NO_REPAIR_SITES: -3,
      REPAIR_FAILED: -4
    },
    
    
    /**
     * Determines whether a structure should be repaired
     * @param structure the structure to check
     * @return true if the structure should be repaired
     */
    should_repair(structure) {
        var repair = false;
        switch (structure.structureType) {
            case STRUCTURE_STORAGE:
            case STRUCTURE_EXTENSION:
            case STRUCTURE_SPAWN:
                repair = structure.hits < structure.hitsMax;
                break;
            case STRUCTURE_CONTAINER:
                repair = structure.hits < 2*structure.hitsMax/3;
                break;
            case STRUCTURE_RAMPART:
                repair = structure.hits < structure.hitsMax/10;
                break;
            case STRUCTURE_ROAD:
                repair = structure.hits < structure.hitsMax/3;
                break;
            case STRUCTURE_WALL:
                repair = structure.hits < 20000;
                break;
        }
        
        if (repair) {
            repair = !Dismantler.has_structures_to_dismantle(structure.room, structure.pos);
            if (!repair) {
                console.log("Won't repair " + structure.structureType + "-" + structure.id + " as it is flagged for deconstruction");
            }
        }
        
        return repair;   
    },
    
    
    /**
     * Indicates whether a structure needs repairing of some kind.
     * @param structure the structure to check
     */
    needs_repairing(structure) {
        return structure.hits < structure.hitsMax;
    },
    
    
    /**
     * Defines the order in which repairs should be taken
     * @param structure the structure to generate a weighting for
     * @return the wieghting for a repair of this structure
     */
    repair_weighting(structure) {
        var damageRatio = structure.hits/structure.hitsMax;
        switch (structure.structureType) {
            case STRUCTURE_SPAWN: return 0;
            case STRUCTURE_STORAGE:
            case STRUCTURE_EXTENSION: return 1000 +  damageRatio*500;
            case STRUCTURE_ROAD:
                return ((structure.hits < structure.hitsMax/5)? 2000 : 4000) + damageRatio*500;
            case STRUCTURE_WALL: 
                if (structure.hits < 1000) return 3000 + structure.hits/1000*500;
                else if (structure.hits < 10000) return 5000 + structure.hits/10000*500;
                else if (structure.hits < 20000) return 7000 + structure.hits/20000*500;
            case STRUCTURE_RAMPART:
                if (structure.hits < structure.hitsMax/50) return 5000 + structure.hits/(structure.hitsMax/50)*500;
                else if (structure.hits < structure.hitsMax/15) return 5000 + structure.hits/(structure.hitsMax/15)*500;
                else if (structure.hits < structure.hitsMax/10) return 7000 + structure.hits/(structure.hitsMax/10)*500;
            case STRUCTURE_CONTAINER:
                if (structure.hits < structure.hitsMax/50) return 2000 + damageRatio*500;
                else if (structure.hits < structure.hitsMax/10) return 4000 + damageRatio*500;
                else if (structure.hits < structure.hitsMax/5) return 6000 + damageRatio*500;
            default: break;
        }
        return 1000000;
    },
    
    
    /**
     * Finds the construction sites in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of construction sites
     */
    find_sites(worker) {
        var sites = worker.room.find(FIND_MY_STRUCTURES, { filter: Repairer.should_repair });
        return _.sortBy(sites, Repairer.repair_weighting);
    },
    
    
    /**
     * Start/Continue the worker building at the site.
     * @param worker the worker to order around
     * @param site the site to build at.  If null, the workers current site is used, or the best available.
     * @return the result of the operation
     */
    work: function(worker, site = null) {
        
        if (worker.spawning) {
            console.log("worker-" + worker.name + " is spawning...");
            return Repairer.ERROR.IS_SPAWNING;
        }
        
        if (_.sum(worker.carry) == 0) {
            console.log("worker-" + worker.name + " has no energy to repair with...");
            return Repairer.ERROR.NO_ENERGY;
        }
        
        if (site == null && worker.memory.site == null) {
            var sites = Repairer.find_sites(worker);
            if (sites.length == 0) {
                console.log("worker-" + worker.name + " found no structures to repair...");
                return Repairer.ERROR.NO_REPAIR_SITES;
            }
            site = sites[0];
            console.log("worker-" + worker.name + " will repair " + site.structureType + "-" + site.id);
            worker.memory.site = site.id;
        }
        else if (worker.memory.site == null) {
            worker.memory.site = site.id;
        }
        else {
            site = Game.getObjectById(worker.memory.site);
        }
        
        if (site == null) {
            console.log("worker-" + worker.name + " has no site to repair...");
            return Repairer.ERROR.REPAIR_FAILED;
        }

        var e = _.sum(worker.carry);
        var h = site.hits;
        var res = worker.repair(site);
        switch (res) {
            case 0:
                console.log("worker-" + worker.name + " repairing " + site.structureType + "-" + site.id + " (energy=" + e + "=>" + worker.carry.energy + ", hits=" + h + " => " + site.hits + "/" + site.hitsMax + ")");
                if (e === _.sum(worker.carry) && h === site.hits) {
                    console.log("worker-" + worker.name + " didn't appear to repair " + site.structureType + "-" + site.id + "...");
                    return Repairer.ERROR.REPAIR_FAILED;
                }
                break;
            case ERR_NOT_IN_RANGE:
                res = worker.moveTo(site);
                if (res != 0) {
                    console.log("worker-" + worker.name + " couldn't move to repair site (" + res + ")");
                    return Repairer.ERROR.REPAIR_FAILED;
                }
                break;
            default:
                console.log("worker-" + worker.name + " failed to repair " + site.structureType + "-" + site.id + " (" + res + ")");
                return Repairer.ERROR.REPAIR_FAILED;
        }
        
        worker.memory.operation = Repairer.OPERATION;
        return Repairer.ERROR.NONE;
    },
};

module.exports = Repairer;
