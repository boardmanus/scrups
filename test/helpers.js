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

    /**
     * Creates a site with the given resources.
     * @param {constructor} siteType site constructor function
     * @param {array} resources array of resources to populate the site with
     * @return {RoomObject} a new room object with the site details
     */
    createSite(siteType, resources = [], room = new Room()) {
      const site = new siteType();
      site.room = room;

      if (!(resources instanceof Array)) {
        resources = [ resources ];
      }

      if (site.hasOwnProperty('store')) {
        _.each(resources, r => site.store[r] = 100);
      }
      else if (site.hasOwnProperty('carry')) {
        _.each(resources, r => site.carry[r] = 100);
      }
      else if (site.hasOwnProperty('energy')) {
        if (_.findIndex(resources, r => r === RESOURCE_ENERGY) >= 0) {
          site.energy = 100;
        }
      }
      else if (site instanceof Resource) {
        const r = resources.length? resources[0] : RESOURCE_ENERGY;
        site.resourceType = r
        site.amount = 100;
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
    }

};

module.exports = Helpers;
