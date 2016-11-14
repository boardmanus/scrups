/**
 * Non-player structure.
 * Spawns NPC Source Keepers that guards energy sources and minerals in some rooms.
 * This structure cannot be destroyed.
 *
 * @class
 * @extends {OwnedStructure}
 */
class StructureKeeperLair extends OwnedStructure {

  constructor() {
    super();
    /**
     * Time to spawning of the next Source Keeper.
     *
     * @type {number}
     */
    this.ticksToSpawn = 0;
  }
}

module.exports = StructureKeeperLair;
