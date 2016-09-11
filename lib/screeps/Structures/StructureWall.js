/**
 * Blocks movement of all creeps.
 *
 * @class
 * @extends {Structure}
 */
StructureWall = function() {
    "use strict";
    /**
     * The amount of game ticks when the wall will disappear (only for automatically placed border walls at the start of the game).
     *
     * @type {number}
     */
    this.ticksToLive = 0;
};

StructureWall.prototype =  _.extend(Object.create(Structure.prototype),
{

});

module.exports = StructureWall;
