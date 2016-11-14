/**
 * A mineral deposit.
 * Can be harvested by creeps with a WORK body part using the extractor structure.
 *
 * @class
 * @extends {RoomObject}
 */
class Mineral extends RoomObject {
  constructor() {
    super();

    /**
     * The remaining amount of resources.
     *
     * @type {number}
     */
    this.mineralAmount = 0;

      /**
       * The resource type, one of the RESOURCE_* constants.
       *
       * @type {number}
       */
    this.mineralType = 0;

      /**
       * A unique object identificator.
       * You can use Game.getObjectById method to retrieve an object instance by its id.
       *
       * @type {string}
       */
    this.id = '';

      /**
       * The remaining time after which the deposit will be refilled.
       *
       * @type {number}
       */
    this.ticksToRegeneration = 0;
  }
}

module.exports = Mineral;
