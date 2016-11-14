/**
 * A site of a structure which is currently under construction.
 * A construction site can be created using the 'Construct' button at the left of the game field or the Room.createConstructionSite method.
 * To build a structure on the construction site, give a worker creep some amount of energy and perform Creep.build action.
 *
 * @class
 * @extends {RoomObject}
 */
class ConstructionSite extends RoomObject {

  constructor() {
    super();

    /**
     * A unique object identificator.
     * You can use Game.getObjectById method to retrieve an object instance by its id.
     *
     * @type {string}
     */
    this.id = "";

      /**
       * Whether this is your own construction site.
       *
       * @type {boolean}
       */
    this.my = true;

      /**
       * An object with the structure’s owner info
       *
       * @type {{username: ""}}
       */

    this.owner =
    {
      username: ""
    };

    /**
     * The current construction progress.
     *
     * @type {number}
     */
    this.progress = 0;

      /**
       * The total construction progress needed for the structure to be built.
       *
       * @type {number}
       */
    this.progressTotal = 0;

      /**
       * One of the STRUCTURE_* constants.
       *
       * @type {string}
       */
    this.structureType = "";
  }

    /**
     * Remove the construction site.
     *
     * @type {function}
     *
     * @return {number|OK|ERR_NOT_OWNER}
     */
  remove() { }
  }

module.exports = ConstructionSite;
