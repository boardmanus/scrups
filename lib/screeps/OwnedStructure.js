/**
 * The base prototype for a structure that has an owner.
 * Such structures can be found using FIND_MY_STRUCTURES and FIND_HOSTILE_STRUCTURES constants.
 *
 * @class
 * @extends {Structure}
 */
class OwnedStructure extends Structure {
  constructor(structureType = '') {
    super(structureType);
    /**
     * Whether this is your own structure.
     *
     * @type {boolean}
     */
    this.my = true;

      /**
       * An object with the structure’s owner info
       *
       * @type {{username: string}}
       */
    this.owner = {
      username: ""
    };
  }
}

module.exports = OwnedStructure;
