/*
 * Waiter logic
 */
 const u = require('utils');

 const Claimer = {


   OPERATION: 'claiming',


   ERROR: {
     NONE: 0,
     IS_SPAWNING: -1,
     NO_CONTROLLERS_TO_CLAIM: -2,
     NOT_CONTROLLER: -3,
     CLAIM_FAILED: -4
   },

   /**
    * Determines if a flag is a dismantler
    * @param flag the flag to check
    * @return true if a dismantler flag
    */
   is_claim_flag(f) {
     return f.name === 'Claim';
   },

   have_controller_to_claim() {
     return Game.flags.Claim != null;
   },

   /**
    * Finds  sites in the room, and orders them by priority.
    * @param room the room to search
    * @return an ordered array of construction sites
    */
   find_controller_to_claim() {
     const flag = Game.flags.Claim;
     if (flag == null) {
       return null;
     }

     console.log(`Found claim flag ${flag}, ${flag.pos.room}, ${flag.pos}`);
     const room = flag.room;
     if (!room) {
       console.log('Found flag, but not in that room...');
       return flag;
     }

     const controller = room.controller;
     if (!controller.owner === 'Piklor') {
       console.log(`controller-${controller.id} already owned by us - ignoring...`);
       flag.remove();
       return null;
     }
     console.log(`Found ${controller.id} to claim`);
     return controller;
   },


  /**
   * Start/Continue the worker waiting.
   * @param worker the worker to order around
   * @return the result of the operation
   */
   work(worker, controller = null) {
     worker.memory.operation = Claimer.OPERATION;

     if (worker.spawning) {
       return Claimer.ERROR.IS_SPAWNING;
     }

     let site = controller;
     if (site == null && worker.memory.site == null) {
       site = Claimer.find_controller_to_claim();
       if (site == null) {
         console.log(`${u.name(worker)} found no controllers to claim...`);
         return Claimer.ERROR.NO_CONTROLLERS_TO_CLAIM;
       }
       console.log(`${u.name(worker)} about to claim ${u.name(site)}`);
       worker.memory.site = site.id;
     } else if (worker.memory.site === null) {
       if (site.structureType !== STRUCTURE_CONTROLLER) {
         return Claimer.ERROR.NOT_CONTROLLER;
       }
       worker.memory.site = site.id;
     } else {
       site = Game.getObjectById(worker.memory.site);
       if (!site
            || (!(site instanceof Flag)
                  && (site.structureType !== STRUCTURE_CONTROLLER))) {
         console.log(`${u.name(worker)} controller id=${worker.memory.site}, (${u.name(site)}) invalid!  Removing...`);
         worker.memory.site = null;
         return Claimer.ERROR.NOT_CONTROLLER;
       }

       if (site instanceof Flag && site.room) {
         site = site.room.controller;
         worker.memory.site = site.id;
       }
     }

     if (site instanceof Flag) {
       worker.moveTo(site);
       return Claimer.ERROR.NONE;
     }
     const res = worker.claimController(site);
     switch (res) {
       case 0:
         break;
       case ERR_NOT_IN_RANGE:
         worker.moveTo(site);
         break;
       default:
         console.log(`${u.name(worker)} failed to claim ${u.name(site)} (${res})`);
         return Claimer.ERROR.CLAIM_FAILED;
     }

     worker.memory.operation = Claimer.OPERATION;
     return Claimer.ERROR.NONE;
   }
 };

 module.exports = Claimer;
