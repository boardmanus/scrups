var SourceInfo = require('info.source');
var RoomInfo = require('info.room');
var Worker = require('worker');
var Repairer = require('worker.repairer');
var Storer = require('worker.storer');
var Upgrader = require('worker.upgrader');
var Waiter = require('worker.waiter');
var Harvester = require('worker.harvester');
var Builder = require('worker.builder');
var Spawner = require('spawner');
var Dismantler = require('worker.dismantler');

function debug(obj, msg) {
    const OUTPUT_DEBUG = false;
    if (!OUTPUT_DEBUG) {
      return;
    }

    var name = "";
    if (obj instanceof Structure) {
        name = obj.structureType + "-" + obj.id + ": ";
    }
    else if (obj instanceof Creep) {
        name = obj.memory.role + "-" + obj.name + "-" + obj.memory.operation + ": ";
    }

    console.log(name + msg);
}

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (var roomName in Game.rooms) {

        var room = Game.rooms[roomName];
        //RoomInfo.init(room);
        var workers = room.find(FIND_MY_CREEPS, (creep) => creep.memory.role == Worker.ROLE);
        var spawners = room.find(FIND_MY_SPAWNS);
        var upgraders = _.filter(workers, function(w) { return w.memory.operation === Upgrader.OPERATION; });
        var builders = _.filter(workers, function(w) { return w.memory.operation === Builder.OPERATION; });
        var repairers = _.filter(workers, function(w) { return w.memory.operation === Repairer.OPERATION; });
        var harvesters = _.filter(workers, function(w) { return w.memory.operation === Harvester.OPERATION; });
        var storers = _.filter(workers, function(w) { return w.memory.operation === Storer.OPERATION; });
        var waiters = _.filter(workers, function(w) { return w.memory.operation === Waiter.OPERATION; });
        var dismantlers = _.filter(workers, function(w) { return w.memory.operation === Dismantler.OPERATION; });
        var towers = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER })
        var enemies = room.find(FIND_HOSTILE_CREEPS);
        var sources = room.find(FIND_SOURCES);
        var flags = room.find(FIND_FLAGS);

        var highways = [];
        if (room.memory.highways == null && spawners.length == 0) {
            sources.forEach(function(source) {
                highways.push(room.controller.pos.findPathTo(source));
                spawners.forEach(function(spawner) {
                   highways.push(spawner.pos.findPathTo(source));
                });
            });

            console.log("Surveyed " + highways.length + " highways.");
            room.memory.highways = highways;

            highways.forEach(function(highway) {
                highway.forEach(function(pos) {
                    var res = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                    if (res != 0) {
                       console.log("Failed to construct road at " + pos + " (err=" + res + ")");
                    }
                });
            });
        }
        else {
            highways = room.memory.highways;
        }

        spawners.forEach(function(spawner) {
            if (workers.length < 10 && !spawner.spawning) {
                var w = Worker.create(spawner, { minEnergy: 3*room.energyAvailable/4 });
                if (w) {
                    console.log("Adding new worker " + w.name);
                }
            }
        });


        console.log("Workers: " + upgraders.length + " upgraders, " + builders.length + " builders, " + repairers.length + " repairers, " +
                    harvesters.length + " harvesters, " + storers.length + " storers, " + dismantlers.length + " dismantlers and " + waiters.length + " waiters.");
        towers.forEach(function(t) {
            if (t.energy == 0) {
                return;
            }
            if (enemies.length == 0) {
                if (t.energy < t.energyCapacity/3) {
                    return;
                }
                var rs = room.find(FIND_STRUCTURES, { filter: (s) => ((s.owner == null) || (s.structureType === STRUCTURE_RAMPART)) && Repairer.should_repair(s) });
                rs = _.sortBy(rs, Repairer.repair_weighting);
                console.log("tower-" + t.id + " has " + rs.length + " repairable structures");
                if (rs.length > 0) {
                    var s = rs[0];
                    console.log("tower-" + t.id + " repairing " + s.structureType + "-" + s.id + "(hits=" + s.hits + ")");
                    var res = t.repair(s);
                    if (res != 0) {
                        console.log("tower-" + t.id + " failed to repair " + s.structureType + "-" + s.id + " (" + res + ")");
                    }
                }
            }
            else {
                var enemy = enemies[0]
                console.log("tower-" + t.id + " attacking enemy-" + enemy.owner + "-" + enemy.name + "-" + enemy.id);
                t.attack(enemy);
            }
        });

        workers.forEach(function(worker) {
            Worker.work(worker);
        });
    }
}
