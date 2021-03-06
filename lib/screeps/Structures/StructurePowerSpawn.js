/**
 * Processes power into your account, and spawns power creeps with special unique powers (in development).
 *
 * @class
 * @extends {OwnedStructure}
 */
class StructurePowerSpawn extends OwnedStructure {

  constructor() {
    super(STRUCTURE_POWER_SPAWN);

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
       * The amount of power containing in this structure.
       *
       * @type {number}
       */
    this.power = 0;

      /**
       * The total amount of power this structure can contain.
       *
       * @type {number}
       */
    this.powerCapacity = 0;
  }

    /**
     * Create a power creep.
     * @note This method is under development.
     *
     * @type {function}
     *
     * @param {string} roomName The name of the power creep.
     *
     * @return {void}
     */
  createPowerCreep(roomName) { }

    /**
     * Register power resource units into your account.
     * Registered power allows to develop power creeps skills.
     *
     * @type {function}
     *
     * @return {number|OK|ERR_NOT_ENOUGH_RESOURCES|ERR_RCL_NOT_ENOUGH}
     */
  processPower() { }

    /**
     * @deprecated Since version 2016-07-11, replaced by `Creep.withdraw()`.
     *
     * Transfer the energy from this structure to a creep.
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

module.exports = StructurePowerSpawn;
