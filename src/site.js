/**
 * A Job Site where work can be performed
 */

const u = require('./utils');

const Site = class Site {

  constructor(type, site) {
    this.type = type;
    this.site = site;
  }

  /**
   * Generate information about the site
   */
  info() {
    return `site-${this.type}-${u.name(this.site)}`;
  }

 /**
  * Determines the priority of the job with respect to the game state.
  */
  workOrders() {
    return [];
  }
};


module.exports = Site;
