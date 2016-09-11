/**
 * Non-player structure.
 * Contains power resource which can be obtained by destroying the structure.
 * Hits the attacker creep back on each attack.
 *
 * @class
 * @extends {OwnedStructure}
 */
StructurePowerBank = function() {
    "use strict";
    /**
     * The amount of power containing.
     *
     * @type {number}
     */
    this.power = 0;

      /**
       * The amount of game ticks when this structure will disappear.
       *
       * @type {number}
       */
      this.ticksToDecay = 0;
};

StructurePowerBank.prototype =  _.extend(Object.create(OwnedStructure.prototype),
{

});

module.exports = StructurePowerBank;
