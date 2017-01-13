"use strict";

const assert = require('chai').assert;
const Sinon = require('sinon');
const Cloner = require('cloner');
const Helper = require('./helpers');

function createRoom(name = 'w1s1', spawners = [ new StructureSpawn() ]) {
  const room = Helper.createRoom(name);
  Sinon.stub(room, "find", (type, opts) => {
    if (type === FIND_MY_SPAWNS) {
      return spawners;
    }
    return [];
  });
  return room;
}

describe('A Cloner', function() {

  describe('Construction', function() {
    it('should be created with expected defaults', function() {
      const room = createRoom();
      const cloner = new Cloner(room);
      assert(cloner.room === room, "Room wasn't expected value");
      assert(room.cloner === cloner, "The cloner wasn't assigned to the room");
      assert(cloner.spawners.length >= 1, "No spawners in room!")
    });
    it('should throw an exception if the room is invalid', function() {
      assert.throw(() => new Cloner(), RangeError);
      assert.throw(() => new Cloner(null), RangeError);
      assert.throw(() => new Cloner(undefined), RangeError);
      assert.throw(() => new Cloner("no"), TypeError);
      assert.throw(() => new Cloner(new Creep()), TypeError);

      // Can't create a cloner in a room with no spawn points
      assert.throw(() => new Cloner(createRoom('w1s1', [])));
    });
    it('should throw an exception if the room already has a cloner', function() {
      const room = createRoom();
      assert.doesNotThrow(() => new Cloner(room));
      assert.throw(() => new Cloner(room), Error);
    });
  });
});
