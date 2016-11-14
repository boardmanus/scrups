/**
 * Claim this structure to take control over the room.
 * The controller structure cannot be damaged or destroyed.
 * It can be addressed by Room.controller property.
 *
 * @class
 * @extends {OwnedStructure}
 */
class StructureController extends OwnedStructure {

  constructor() {
    super();

    /**
     * Current controller level, from 0 to 8.
     *
     * @type {number}
     */
    this.level = 0;

      /**
       * The current progress of upgrading the controller to the next level.
       *
       * @type {number}
       */
    this.progress = 0;

      /**
       * The progress needed to reach the next level.
       *
       * @type {number}
       */
    this.progressTotal = 0;

      /**
       * An object with the controller reservation info if present
       *
       * @type {null|{username: string, ticksToEnd: number}}
       */
    this.reservation = {};

    /**
     * The amount of game ticks when this controller will lose one level.
     * This timer can be reset by using Creep.upgradeController.
     *
     * @type {number}
     */
    this.ticksToDowngrade = 0;

      /**
       * The amount of game ticks while this controller cannot be upgraded due to attack.
       *
       * @type {number}
       */
    this.upgradeBlocked = 0;
  }

    /**
     * Make your claimed controller neutral again.
     *
     * @type {function}
     *
     * @return {number|OK|ERR_NOT_OWNER}
     */
  unclaim() { }
}

module.exports = StructureController;
