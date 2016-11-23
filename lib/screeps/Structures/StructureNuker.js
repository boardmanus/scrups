/**
 * Launches a nuke to another room dealing huge damage to the landing area.
 * Each launch has a cooldown and requires energy and ghodium resources.
 * Launching creates a Nuke object at the target room position which is visible to any player until it is landed.
 * Incoming nuke cannot be moved or cancelled. Nukes cannot be launched from or to novice rooms.
 *
 * @class
 * @extends {OwnedStructure}
 */
class StructureNuker extends OwnedStructure {

  constructor() {
    super(STRUCTURE_NUKER);
    /**
     * The amount of energy containing in this structure.
     *
     * @type {number}
     */
    this.energy = 0;

      /**
       * The total amount of energy this structure can contain.
       *
       * @type {number}
       */
    this.energyCapacity = 0;

      /**
       * The amount of ghodium containing in this structure.
       *
       * @type {number}
       */
    this.ghodium = 0;

      /**
       * The total amount of ghodium this structure can contain.
       *
       * @type {number}
       */
    this.ghodiumCapacity = 0;

      /**
       * The amount of game ticks until the next launch is possible.
       *
       * @type {number}
       */
    this.cooldown = 0;
  }

    /**
     * Launch a nuke to the specified position.
     *
     * @type {function}
     *
     * @param {RoomPosition} pos The target room position.
     *
     * @return {number|OK|ERR_NOT_OWNER|ERR_NOT_ENOUGH_RESOURCES|ERR_INVALID_TARGET|ERR_NOT_IN_RANGE|ERR_TIRED|ERR_RCL_NOT_ENOUGH}
     */
  launchNuke(pos) { }
}

module.exports = StructureNuker;
