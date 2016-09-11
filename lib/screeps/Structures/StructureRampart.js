/**
 * Blocks movement of hostile creeps, and defends your creeps and structures on the same tile.
 *
 * @class
 * @extends {OwnedStructure}
 */
StructureRampart = function() {
    "use strict";
    /**
     * The amount of game ticks when this rampart will lose some hit points.
     *
     * @type {number}
     */
    this.ticksToDecay = 0
};

StructureRampart.prototype =  _.extend(Object.create(OwnedStructure.prototype),
{

});

module.exports = StructureRampart;
