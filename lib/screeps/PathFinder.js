/**
 *
 * @class
 */
class PathFinder {

    /**
     * Find an optimal path between origin and goal.
     *
     * @type {function}
     *
     * @param {RoomPosition} origin The start position.
     * @param {object} goal A goal or an array of goals. If more than one goal is supplied then the cheapest path found out of all the goals will be returned. A goal is either a RoomPosition or an object as defined below.
                       Important: Please note that if your goal is not walkable (for instance, a source) then you should set range to at least 1 or else you will waste many CPU cycles searching for a target that you can't walk on.

                       pos
                       RoomPosition
                       The target.
                       range
                       number
                       Range to pos before goal is considered reached. The default is 0.
     * @param {object} [opts] An object containing additional pathfinding flags.
     * @param {function} [opts.roomCallback] Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix. If you return false from the callback the requested room will not be searched, and it won't count against maxRooms
     * @param {number} [opts.plainCost] Cost for walking on plain positions. The default is 1.
     * @param {number} [opts.swampCost] Cost for walking on swamp positions. The default is 5.
     * @param {boolean} [opts.flee] Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.
     * @param {number} [opts.maxOps] The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.
     * @param {number} [opts.maxRooms] The maximum allowed rooms to search. The default (and maximum) is 16.
     * @param {number} [opts.heuristicWeight] Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.2.
     *
     * @return {{path:Array<RoomPosition>,opts:number}} An object containing: path - An array of RoomPosition objects; ops - Total number of operations performed before this path was calculated.
     */
  search(origin, goal, opts) { }

    /**
     * Specify whether to use this new experimental pathfinder in game objects methods.
     * This method should be invoked every tick.
     *
     * @note It affects the following methods behavior: Room.findPath, RoomPosition.findPathTo, RoomPosition.findClosestByPath, Creep.moveTo.
     *
     * @type {function}
     *
     * @param {boolean} isEnabled Whether to activate the new pathfinder or deactivate.
     */
  use(isEnabled) { }
}

/**
 * Creates a new CostMatrix containing 0's for all positions.
 *
 * @constructor
 * @class
 */
PathFinder.CostMatrix = class CostMatrix {

    /**
     * Set the cost of a position in this CostMatrix.
     *
     * @type {function}
     *
     * @param {number} x X position in the room.
     * @param {number} y Y position in the room.
     * @param {number} cost Cost of this position. Must be a whole number. A cost of 0 will use the terrain cost for that tile. A cost greater than or equal to 255 will be treated as unwalkable.
     */
  set(x, y, cost) { }

    /**
     * Get the cost of a position in this CostMatrix.
     *
     * @type {function}
     *
     * @param {number} x X position in the room.
     * @param {number} y Y position in the room.
     *
     * @return {number}
     */
  get(x, y) { }

    /**
     * Copy this CostMatrix into a new CostMatrix with the same data.
     *
     * @type {function}
     *
     * @return {CostMatrix}
     */
  clone() { }

    /**
     * Returns a compact representation of this CostMatrix which can be stored via JSON.stringify
     *
     * @type {function}
     *
     * @return {Array<number>} An array of numbers. There's not much you can do with the numbers besides store them for later.
     */
  serialize() { }

    /**
     * Static method which deserializes a new CostMatrix using the return value of serialize.
     * @static
     *
     * @type {function}
     *
     * @param {object} val Whatever serialize returned
     *
     * @return {CostMatrix}
     */
  deserialize(val) { }
};

module.exports = PathFinder;
