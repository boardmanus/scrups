/**
 * An energy source object.
 * Can be harvested by creeps with a WORK body part.
 *
 * @class
 * @extends {RoomObject}
 */
class Source extends RoomObject {
  constructor() {
    super();

    /**
     * The remaining amount of energy.
     *
     * @type {number}
     */
    this.energy = 0;

      /**
       * The total amount of energy in the source.
       *
       * @type {number}
       */
    this.energyCapacity = 3000;

      /**
       * A unique object identificator.
       * You can use Game.getObjectById method to retrieve an object instance by its id.
       *
       * @type {string}
       */
    this.id = '';

      /**
       * The remaining time after which the source will be refilled.
       *
       * @type {number}
       */
    this.ticksToRegeneration = 0;
  }
}

module.exports = Source;
