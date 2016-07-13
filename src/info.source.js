/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('info.source');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    create: function(spawner, source) {
        var _spawner = spawner;
        var _source = source;
        console.log("Finding path from " + spawner.pos + " to " + source.pos);
        var _path = spawner.pos.findPathTo(source.pos);
        var _creeps = [];

        this.creeps = function() {
            return _creeps;
        };

        this.path = function() {
            return _path;
        };
    }
};
