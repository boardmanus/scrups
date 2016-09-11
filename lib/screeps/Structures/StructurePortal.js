/**
 * A non-player structure.
 * Instantly teleports your creeps to a distant room acting as a room exit tile.
 * Portals appear randomly in the central room of each sector.
 *
 * @class
 * @extends {Structure}
 */
StructurePortal = function() {
    "use strict";
    /**
     * The position object in the destination room.
     *
     * @type {RoomPosition}
     */
    this.destination = null;

      /**
       * The amount of game ticks when the portal disappears, or undefined when the portal is stable.
       *
       * @type {undefined|number}
       */
      this.ticksToDecay = 0;
};

StructurePortal.prototype =  _.extend(Object.create(Structure.prototype),
{

});

module.exports = StructurePortal;
