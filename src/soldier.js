/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('soldier');
 * mod.thing == 'a thing'; // true
 */

var Soldier = {

  ROLE: 'soldier',

    /**
     * Operations a soldier can perform
     */
  OPERATION: {
    WAITING: 'waiting',
    PATROLING: 'patroling',
    DEFENDING: 'defending',
    ATTACKING: 'attacking',
  },

    /**
     * The cost of soldier parts
     */
  COST: {
    MOVE: 50,
    ATTACK: 80,
    RANGED_ATTACK: 150,
    TOUGH: 10,
  },

    /**
     * Create a new soldier
     * @param spawner the spawner to create the soldier from
     * @param ranged whether the soldier is a ranged attacker
     * @param maxEnergy the max energy allowed to create the soldier
     * @return the new soldier
     */
  create(spawner, ranged, maxEnergy = -1) {
    var e = spawner.room.energyAvailable;
    if (maxEnergy >= 0 && maxEnergy < e) {
      e = maxEnergy;
    }

    var attackCost = ranged ? Soldier.COST.RANGED_ATTACK : Soldier.COST.ATTACK;
    var attackPart = ranged ? RANGED_ATTACK : ATTACK;
    var body = [MOVE, TOUGH, attackPart];

    e -= attackCost - Soldier.COST.MOVE - Soldier.COST.TOUGH;
    if (e < 0) {
      return null;
    }

    var minCost = Soldier.COST.TOUGH;
    while (e >= minCost) {
      if (e >= attackCost) {
        body.push(attackPart);
        e = e - attackCost;
        console.log('added ' + attackPart + ' - energy=' + e);
      }
      if (e >= Soldier.COST.MOVE) {
        body.push(MOVE);
        e = e - Soldier.COST.MOVE;
        console.log('added move - energy=' + e);
      }
      if (e >= Soldier.COST.TOUGH) {
        body.push(TOUGH);
        e = e - Soldier.COST.TOUGH;
        console.log('added toughness - energy=' + e);
      }
    }

    var soldier = spawner.createCreep(body, null, { role: Soldier.ROLE, operation: Soldier.OPERATION.WAITING });
    if (!_.isString(soldier)) {
      console.log('Failed to spawn new soldier with body ' + body);
      return null;
    }

    console.log('Spawned soldier-' + soldier + ' with body ' + body);
    return Game.creeps[soldier];
  },

    /**
     * Perform a soldier action
     * @param soldier the soldier
     * @return the soldier for chaining
     */
  work(soldier) {
    operation = soldier.memory.operation;
    if (operation === null) {
      operation = Soldier.OPERATION.WAITING;
    }
    switch (operation) {
      case Soldier.OPERATION.WAITING: break;
      case Soldier.OPERATION.PATROLING: break;
      case Soldier.OPERATION.DEFENDING: break;
      case Soldier.OPERATION.ATTACKING: break;
      default: break;
    }

    return soldier;
  },
};

module.exports = Soldier;
