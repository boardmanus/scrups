/**
 * A Country representation of the players territory.
 */
const City = require('./city');
const Builder = require('worker.builder');
const Upgrader = require('worker.upgrader');
const Waiter = require('worker.waiter');
const u = require('utils');

const Country = class Country {

  constructor() {
    this.cities = Object.keys(Game.rooms).map((roomName) =>
      new City(Game.rooms[roomName])
    );
  }

  /**
   * Generate information about the site
   */
  run() {
    this.cities.forEach((city) => {
      if (!city.needsHelp()) {
        return;
      }

      const upgraders = city.citizens.filter((c) =>
        c.operation === Upgrader.OPERATION);
      const builders = city.citizens.filter((c) =>
        c.operation === Builder.OPERATION);
      const spawnSite = city.constructionSites.filter((cs) =>
        cs.structureType === STRUCTURE_SPAWN);
      if (upgraders.length > 0 && (builders.length > 0 || !spawnSite)) {
        return;
      }

      this.cities.forEach((otherCity) => {
        if (city === otherCity) {
          return;
        }

        const idleWorkers = otherCity.citizens.filter((c) =>
          c.operation === Waiter.OPERATION);
        if (idleWorkers.length > 0 && upgraders.length === 0) {
          const upgrader = idleWorkers.pop();
          upgraders.push(upgrader);
          console.log(`Borrowing ${u.name(upgrader)} from ${otherCity.info()} for ${city.info()})`);
          Upgrader.work(upgrader, city.controller);
        }

        if (idleWorkers.length > 0 && spawnSite && builders.length === 0) {
          const builder = idleWorkers.pop();
          builders.push(builder);
          console.log(`Borrowing ${u.name(builder)} from ${otherCity.info()} for ${city.info()})`);
          Builder.work(builder, spawnSite);
        }
      });
    });
  }
};


module.exports = Country;
