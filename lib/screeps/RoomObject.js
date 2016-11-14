/**
 * Any object with a position in a room.
 * Almost all game objects prototypes are derived from RoomObject.
 * @class
 */
class RoomObject {
  constructor() {
  /**
   * An object representing the position of this object in the room.
   *
   * @type {RoomPosition}
   */
    this.pos = null;

    /**
     * The link to the Room object.
     * May be undefined in case if an object is a flag and is placed in a room that is not visible to you.
     *
     * @type {Room}
     */
    this.room = null;
  }
}

module.exports = RoomObject;
