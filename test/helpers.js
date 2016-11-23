const Sinon = require('sinon');
const Job = require('job.all');

const Helpers = {
  stubGetObjectById(testId, gameObj) {
    const stub = Sinon.stub(Game, 'getObjectById', (id) => {
      if (id !== testId) {
        return null;
      }
      gameObj.id = id;
      return gameObj;
    });
    return stub;
  },

  unstubGetObjectById() {
    Game.getObjectById.restore();
  },

  asResourceObj(r) {
    if (typeof r === 'string') {
      return { type: r, amount: 50 };
    }
    else if (typeof r === 'number') {
      return { type: RESOURCE_ENERGY, amount: r };
    }
    else if (r instanceof Object) {
      if (!r.type && !r.amount && !(r.type instanceof String) && (typeof r.amount === 'number')) {
        throw new RangeError(`Invalid obj: {type: ${r.type}, amount: ${r.amount}}`);
      }
      return r;
    }

    throw new RangeError(`Invalid obj: ${r}`);
  },

  /**
   * Creates a site with the given resources.
   * @param {constructor} siteType site constructor function
   * @param {array} resources array of resources to populate the site with
   * @return {RoomObject} a new room object with the site details
   */
   createRoom(name = 'W10S1') {
     const room = new Room();
     room.name = name;
     return room;
   },
   createSite(siteType, resources = [], room = Helpers.createRoom()) {
    const site = new siteType();
    site.room = room;
    site.id = _.uniqueId();

    if (!(resources instanceof Array)) {
      resources = [ resources ];
    }

    if (site.hasOwnProperty('store')) {
      _.each(resources, r => {
        r = Helpers.asResourceObj(r);
        site.store[r.type] = r.amount;
      });
    }
    else if (site.hasOwnProperty('carry')) {
      _.each(resources, r => {
        r = Helpers.asResourceObj(r);
        site.carry[r.type] = r.amount;
      });
    }
    else if (site.hasOwnProperty('energy')) {
      _.each(resources, r => {
        r = Helpers.asResourceObj(r);
        if (r.type === RESOURCE_ENERGY) {
          site.energy = r.amount;
        }
      });
    }
    else if (site instanceof Resource) {
      if (resources.length === 0) {
        site.resourceType = RESOURCE_ENERGY;
        site.amount = 100;
      }
      else {
        const r = Helpers.asResourceObj(resources[0]);
        site.resourceType = r.type;
        site.amount = r.amount;
      }
    }
    else {
      throw new ArgumentError(`Bad arguments: ${siteType}, ${resources}`);
    }

    return site;
  },
  createPickupSite(siteType, resources = []) {
    const site = Helpers.createSite(siteType, resources);
    if (site instanceof Creep) {
      site.job = new Job.Harvest(new Source());
    }
    return site;
  },
  createCreep(carryCapacity = 0, resources = []) {
    const creep = Helpers.createSite(Creep, resources);
    creep.carryCapacity = carryCapacity;
    creep.name = 'Bob';
    return creep;
  },
  createTower(energyCapacity = 0, resources = []) {
    const tower = Helpers.createSite(StructureTower, resources);
    tower.energyCapacity = energyCapacity;
    return tower;
  }
};

module.exports = Helpers;
