/*
 * Storer logic
 */

var Storer = {
    
    
    OPERATION: 'storing',

    
    ERROR: {
      NONE: 0,
      NO_ENERGY: -1,
      IS_SPAWNING: -2,
      NO_STORAGE_SITES: -3,
      STORAGE_FAILED: -4
    },
    
    
    is_storable(structure) {
        switch (structure.structureType) {
            case STRUCTURE_EXTENSION:
            case STRUCTURE_SPAWN:
            case STRUCTURE_TOWER:
                return (structure.energy < structure.energyCapacity);
            case STRUCTURE_CONTAINER:
            case STRUCTURE_STORAGE:
                return (_.sum(structure.store) < structure.storeCapacity);
        }
        
        return false;
    },
    
    

    storage_weighting(worker, structure) {
        var weight = 1000;
        var ratio = 1.0;
        switch (structure.structureType) {
            case STRUCTURE_STORAGE:
                ratio = _.sum(structure.store)/structure.storeCapacity;
                if (ratio < 0.1) {
                    weight = 2000;
                }
                else if (ratio < 0.3) {
                    weight = 4000;
                }
                else if (ratio < 0.6) {
                    weight = 6000;
                }
                else {
                    weight = 8000;
                }
                break;
            case STRUCTURE_CONTAINER: 
                ratio = _.sum(structure.store)/structure.storeCapacity;
                if (ratio < 0.3) {
                    weight = 3000;
                }
                else if (ratio < 0.7) {
                    weight = 5000;
                }
                else {
                    weight = 7000;
                } 
                break;
            case STRUCTURE_TOWER:
                if (structure.room.find(FIND_HOSTILE_CREEPS).length > 0) {
                    return 0;
                }
                break;
            default: break;
        }
        return weight + worker.pos.getRangeTo(structure);
    },
    
    /**
     * Finds the storage sites in the room, and orders them by priority.
     * @param room the room to search
     * @return an ordered array of storage sites
     */
    find_sites(worker) {
        var sites = worker.room.find(FIND_STRUCTURES, { filter: Storer.is_storable });
        console.log("Found " + sites.length + " sites to store energy at...");
        return _.sortBy(sites, (s) => Storer.storage_weighting(worker, s));
    },
    
    
    /**
     * Start/Continue the worker storing at the site.
     * @param worker the worker to order around
     * @param site the site to store at.  If null, the workers current site is used, or the best available.
     * @return the result of the operation
     */
    work: function(worker, site = null) {
        
        if (worker.spawning) {
            return Storer.ERROR.IS_SPAWNING;
        }
        
         if (_.sum(worker.carry) == 0) {
            console.log("worker-" + worker.name + " has no energy to store...");
            return Storer.ERROR.NO_ENERGY;
        }
        
        if ((site == null) && (worker.memory.site != null)) {
            site = Game.getObjectById(worker.memory.site);
        }
        
        if (site != null && site.energy == site.energyCapacity) {
            site = null;
            worker.memory.site = null;
        }
        
        if (site == null && worker.memory.site == null) {
            var sites = Storer.find_sites(worker);
            if (sites.length == 0) {
                return Storer.ERROR.NO_STORAGE_SITES;
            }
            site = sites[0];
            worker.memory.site = site.id;
        }
        else if (worker.memory.site == null) {
            worker.memory.site = site.id;
        }
        else {
            site = Game.getObjectById(worker.memory.site);
        }

        var res = worker.transfer(site, RESOURCE_ENERGY);
        switch (res) {
            case 0: 
                break;
            case ERR_NOT_IN_RANGE:
                var constructRoad = true;
                var items = worker.room.lookAt(worker);
                for (var i in items) {
                   var item = items[i];
                   if ((item.type == LOOK_CONSTRUCTION_SITES)
                        || ((item.type == LOOK_STRUCTURES)
                            && (item.structure.structureType == STRUCTURE_ROAD))) {
                        constructRoad = false;
                        break;
                    }
                }
                if (constructRoad) {
                    worker.room.createConstructionSite(worker, STRUCTURE_ROAD);
                    if (res != 0) {
                        console.log("worker-" + worker.name + " failed marking a road on the way to " + site.structureType + "-" + site.id);
                    }                }

                worker.moveTo(site);
                break;
            default: 
                console.log("worker:store-" + worker.name + " failed to store energy at " + site.structureType + "-" + site.id + " (" + res + ")");
                return Storer.ERROR.STORAGE_FAILED;
        }
        
        worker.memory.operation = Storer.OPERATION;
        return Storer.ERROR.NONE;
    },
};

module.exports = Storer;
