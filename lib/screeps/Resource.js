/**
 * A dropped piece of resource.
 * It will decay after a while if not picked up.
 * Dropped resource pile decays for ceil(amount/1000) units per tick.
 *
 * @class
 * @extends {RoomObject}
 */
class Resource extends RoomObject {
  constructor() {
    super();

    /**
     * The amount of resource units containing.
     *
     * @type {number}
     */
    this.amount = 0;

      /**
       * A unique object identificator.
       * You can use Game.getObjectById method to retrieve an object instance by its id.
       *
       * @type {string}
       */
    this.id = "";

      /**
       * One of the RESOURCE_* constants.
       *
       * @type {string}
       */
    this.resourceType = "";
  }
}
module.exports = Resource;
