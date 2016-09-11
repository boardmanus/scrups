/**
 * A nuke landing position.
 * This object cannot be removed or modified.
 * You can find incoming nukes in the room using the FIND_NUKES constant.
 * @class
 * @extends {RoomObject}
 */
Nuke = function() {
    "use strict";
    /**
     * A unique object identificator.
     * You can use Game.getObjectById method to retrieve an object instance by its id.
     *
     * @type {string}
     */
    this.id = "";

      /**
       * The name of the room where this nuke has been launched from.
       *
       * @type {string}
       */
    this.launchRoomName = "";

      /**
       * The remaining landing time.
       *
       * @type {number}
       */
    this.timeToLand = 0;
};

Nuke.prototype =
{

};
