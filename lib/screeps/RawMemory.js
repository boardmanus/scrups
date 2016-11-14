/**
 * RawMemory object allows to implement your own memory stringifier instead of built-in serializer based on JSON.stringify.
 *
 * @class
 */
class RawMemory {

    /**
     * Get a raw string representation of the Memory object.
     *
     * @type {function}
     *
     * @return {string}
     */
  get() { }

    /**
     * Set new memory value.
     *
     * @type {function}
     *
     * @param {string} value
     *
     * @return {void}
     */
  set(value) { }
}

module.exports = RawMemory;
