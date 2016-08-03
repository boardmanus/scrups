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
    Game.country = this;

    this.cities = Object.keys(Game.rooms).map((roomName) =>
      new City(Game.rooms[roomName])
    );
  }

  audit() {
    this.spawnSites = [];
    _.each(this.cities, (c) => c.audit());
  }


  /**
   * Generate information about the site
   */
  run() {
    this.cities.forEach((city) => {
      city.run();
      if (!city.needsHelp()) {
        return;
      }

      const upgraders = city.citizens.filter((c) =>
        c.operation === Upgrader.OPERATION);
      const builders = city.citizens.filter((c) =>
        c.operation === Builder.OPERATION);
      const spawnSites = city.constructionSites.filter((cs) =>
        cs.structureType === STRUCTURE_SPAWN);
      if (spawnSites.length > 0) {
        console.log(`City-${u.name(city.room)} has spawn construction sites`);
        spawnSites.forEach((ss) => {
          console.log(`Adding spawn construction site ${ss}`);
          this.spawnSites.push(ss);
        });
      }
      if (upgraders.length > 0 && (builders.length > 0 || spawnSites.length === 0)) {
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
          city.relocate(upgrader.creep);
          console.log(`Borrowing ${u.name(upgrader)} from ${otherCity.info()} for ${city.info()})`);
          Upgrader.work(upgrader, city.controller);
        }

        if (idleWorkers.length > 0 && spawnSites.length > 0 && builders.length === 0) {
          const builder = idleWorkers.pop();
          builders.push(builder);
          console.log(`Borrowing ${u.name(builder)} from ${otherCity.info()} for ${city.info()})`);
          Builder.work(builder, spawnSites[0]);
        }
      });
    });
  }
};


/**
 * Monkey patch the base game classes to provide easier access to important
 * functionality.
 */
Country.monkeyPatch = function monkeyPatch() {
  Game.report = {};
  Game.cmd = {};
  City.monkeyPatch();
};


module.exports = Country;
