

const Highways = {
  work(room) {
    const spawners = room.find(FIND_MY_SPAWNS);
    const sources = room.find(FIND_SOURCES);
    let highways = [];
    if (spawners.length !== 0) {
      sources.forEach((source) => {
        highways.push(room.controller.pos.findPathTo(source));
        spawners.forEach((spawner) => {
          highways.push(spawner.pos.findPathTo(source));
        });
      });

      console.log(`Surveyed ${highways.length} highways.`);
      //room.memory.highways = highways;

      highways.forEach((highway) => {
        highway.forEach((pos) => {
          const res = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
          if (res !== 0) {
            console.log(`Failed to construct road at ${pos} (err=${res})`);
          }
        });
      });
    } else {
      highways = room.memory.highways;
    }
  },
};

module.exports = Highways;
