/**
 * Non-player structure.
 * Spawns NPC Source Keepers that guards energy sources and minerals in some rooms.
 * This structure cannot be destroyed.
 *
 * @class
 * @extends {OwnedStructure}
 */
StructureKeeperLair = function() {
    "use strict";
    /**
     * Time to spawning of the next Source Keeper.
     *
     * @type {number}
     */
    this.ticksToSpawn = 0;
};

StructureKeeperLair.prototype = _.extend(Object.create(OwnedStructure.prototype),
{

});

module.exports = StructureKeeperLair;
