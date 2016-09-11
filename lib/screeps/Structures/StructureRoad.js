/**
 * Decreases movement cost to 1.
 * Using roads allows creating creeps with less MOVE body parts.
 *
 * @class
 * @extends {Structure}
 */
StructureRoad = function() {
    "use strict";
    /**
     * The amount of game ticks when this road will lose some hit points.
     *
     * @type {number}
     */
    this.ticksToDecay = 0
};

StructureRoad.prototype =  _.extend(Object.create(Structure.prototype),
{

});

module.exports = StructureRoad;
