/**
 * Contains energy which can be spent on spawning bigger creeps.
 * Extensions can be placed anywhere in the room, any spawns will be able to use them regardless of distance.
 *
 * @class
 * @extends {OwnedStructure}
 */
class StructureExtension extends OwnedStructure {

  constructor() {
    super(STRUCTURE_EXTENSION);
    /**
     * The amount of energy containing in the extension.
     *
     * @type {number}
     */
    this.energy = 0;

      /**
       * The total amount of energy the extension can contain.
       *
       * @type {number}
       */
    this.energyCapacity = 0;
  }

    /**
     * @deprecated Since version 2016-07-11, replaced by `Creep.withdraw()`.
     *
     * Transfer the energy from the extension to a creep.
     * You can transfer resources to your creeps from hostile structures as well.
     *
     * @type {function}
     *
     * @param {Creep} target The creep object which energy should be transferred to.
     * @param {number|undefined|null} [amount] The amount of energy to be transferred. If omitted, all the remaining amount of energy will be used.
     *
     * @return {number|OK|ERR_NOT_OWNER|ERR_NOT_ENOUGH_RESOURCES|ERR_INVALID_TARGET|ERR_FULL|ERR_NOT_IN_RANGE}
     */
  transferEnergy(target, amount) { }
}

module.exports = StructureExtension;
