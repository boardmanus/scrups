/**
 * Decreases movement cost to 1.
 * Using roads allows creating creeps with less MOVE body parts.
 *
 * @class
 * @extends {Structure}
 */
class StructureRoad extends Structure {

  constructor() {
    super();

    /**
     * The amount of game ticks when this road will lose some hit points.
     *
     * @type {number}
     */
    this.ticksToDecay = 0;
  }
}

module.exports = StructureRoad;
