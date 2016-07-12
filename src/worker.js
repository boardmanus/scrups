/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('worker');
 * mod.thing == 'a thing'; // true
 */
var Builder = require('worker.builder');
var Harvester = require('worker.harvester');
var Upgrader = require('worker.upgrader');
var Storer = require('worker.storer');
var Repairer = require('worker.repairer');
var Waiter = require('worker.waiter');
var Dismantler = require('worker.dismantler');


/**
 * The cost of worker parts
 */
const COST = {
    MOVE: 50,
    CARRY: 50,
    WORK: 100
};

const MIN_PART_COST = COST.MOVE;
const MIN_COST = COST.MOVE + COST.CARRY + COST.WORK;


Creep.prototype.is_lazy = function() {
    return this.memory.operation === Waiter.OPERATION;
}

var Worker = {
    
    ROLE: 'worker',
    
    create: function(spawner, attribs = {}) {
        var e = spawner.room.energyAvailable;
        
        // Ensure there is enough energy to create the worker
        if (e < MIN_COST ||
            (attribs.minEnergy && e < attribs.minEnergy)) {
            console.log("Spawner doesn't have enough energy to create desired worker (energy=" + e + ")");
            return null;
        }
        
        // Limit the creation to any specified maximum
        if (attribs.maxEnergy && attribs.maxEnergy < e) {
            e = attribs.maxEnergy;
        }
        
        // Remove the default body energy from the equation...
        var body = [MOVE, WORK, CARRY];
        e -= MIN_COST;
        
        // Keep adding body parts until we run out of energy
        var workerToCarry = 2;
        var carryToMove = 2;
        while (e >= MIN_PART_COST) {
            // First put in the correct ratio of work parts
            for (var j = 0; j < workerToCarry; ++j) {
                if (e >= COST.WORK) {
                    body.push(WORK);
                    e = e - COST.WORK;
                    console.log("added work - energy=" + e);
                }
            }

            if (e >= COST.CARRY) {
                body.push(CARRY);
                e = e - COST.CARRY;
                console.log("added carry - energy=" + e);
            }
            
            if (e >= COST.MOVE) {
                body.push(MOVE);
                e = e - COST.MOVE;
                console.log("added move - energy=" + e);
            }
        }
        
        var worker = spawner.createCreep(body, null, { role: Worker.ROLE, operation: Waiter.OPERATION });
        if (!_.isString(worker)) {
            console.log("Failed to spawn new worker with body " + body);
            return null;
        }
        
        console.log("Spawned worker-" + worker + " with body " + body);
        return Game.creeps[worker];
    },
    
    wait: function(worker) {
        Waiter.work(worker);
        return worker;
    },
    
    harvest: function(worker, source = null) {
        if (Harvester.work(worker, source) !== Harvester.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },
    
    store: function(worker, site = null) {
        if (Storer.work(worker, site) !== Storer.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },
    
    upgrade: function(worker) {
        if (Upgrader.work(worker) !== Upgrader.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },
    
    build: function(worker, site = null) {
        if (Builder.work(worker, site) !== Builder.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },
    
    repair: function(worker, site = null) {
        if (Repairer.work(worker, site) !== Repairer.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },

    dismantle: function(worker, site = null) {
        if (Dismantler.work(worker, site) !== Repairer.ERROR.NONE) {
            return Worker.wait(worker);
        }
        
        return worker;
    },
    
    work: function(worker) {
        
         if (worker.memory.operation == null) {
            console.log("worker-" + worker.name + " has no operation set...");
            Waiter.work(worker);
            return worker;
        }
        
        switch (worker.memory.operation) {
            case Waiter.OPERATION:
                return Worker.wait(worker);
            case Harvester.OPERATION:
                return Worker.harvest(worker);
            case Storer.OPERATION:
                return Worker.store(worker);
            case Upgrader.OPERATION:
                return Worker.upgrade(worker);
            case Builder.OPERATION:
                return Worker.build(worker);
            case Repairer.OPERATION:
                return Worker.repair(worker);
            case Dismantler.OPERATION:
                return Worker.dismantle(worker);
            default:
                break;
        }
        
        return worker;
    }
};

module.exports = Worker;
