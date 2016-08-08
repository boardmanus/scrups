let usedOnStart = 0;
let depth = 0;


function resetMemory() {
  Memory.profiler = null;
}


function overloadCPUCalc() {
  if (Game.rooms.sim) {
    usedOnStart = 0; // This needs to be reset, but only in the sim.
    Game.cpu.getUsed = function getUsed() {
      return performance.now() - usedOnStart;
    };
  }
}


function getFilter() {
  return Memory.profiler.filter;
}

const Profiler = {
  printProfile() {
    console.log(Profiler.output());
  },

  emailProfile() {
    Game.notify(Profiler.output());
  },

  output() {
    const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
    const header = 'calls\t\ttime\t\tavg\t\tpercentage\tfunction';
    const footer = [
      `Avg: ${(Memory.profiler.totalTime / elapsedTicks).toFixed(2)}`,
      `Total: ${Memory.profiler.totalTime.toFixed(2)}`,
      `Ticks: ${elapsedTicks}`,
      `Percentage: ${Memory.profiler.totalTime / elapsedTicks
        / Game.cpu.limit.toFixed(2)}`,
    ].join('\t');
    return [].concat(header, Profiler.lines().slice(0, 50), footer).join('\n');
  },

  lines() {
    // const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
    const stats = Object.keys(Memory.profiler.map).map(functionName => {
      const functionCalls = Memory.profiler.map[functionName];
      return {
        name: functionName,
        calls: functionCalls.calls,
        totalTime: functionCalls.time,
        averageTime: functionCalls.time / functionCalls.calls,
        percentage: functionCalls.time / Game.cpu.limit * 100,
      };
    }).sort((val1, val2) => val2.totalTime - val1.totalTime);

    const lines = stats.map(data => [
      data.calls,
      data.totalTime.toFixed(1),
      data.averageTime.toFixed(3),
      data.percentage.toFixed(2),
      data.name,
    ].join('\t\t'));

    return lines;
  },

  prototypes: [
    { name: 'Game', val: Game },
    { name: 'Room', val: Room },
    { name: 'Structure', val: Structure },
    { name: 'Spawn', val: Spawn },
    { name: 'Creep', val: Creep },
    { name: 'RoomPosition', val: RoomPosition },
    { name: 'Source', val: Source },
    { name: 'Flag', val: Flag },
  ],

  record(functionName, time) {
    if (!Memory.profiler.map[functionName]) {
      Memory.profiler.map[functionName] = {
        time: 0,
        calls: 0,
      };
    }
    Memory.profiler.map[functionName].calls++;
    Memory.profiler.map[functionName].time += time;
  },

  endTick() {
    if (Memory.profiler.enabledTick > 0 &&
          Game.time >= Memory.profiler.enabledTick) {
      const cpuUsed = Game.cpu.getUsed();
      Memory.profiler.totalTime += cpuUsed;
      Profiler.report();
    }
  },

  report() {
    if (Profiler.shouldPrint()) {
      Profiler.printProfile();
    } else if (Profiler.shouldEmail()) {
      Profiler.emailProfile();
    }
  },

  isProfiling() {
    return !!Memory.profiler && Game.time <= Memory.profiler.disableTick;
  },

  type() {
    return Memory.profiler.type;
  },

  shouldPrint() {
    const streaming = Profiler.type() === 'stream';
    const profiling = Profiler.type() === 'profile';
    const onEndingTick = Memory.profiler.disableTick === Game.time;
    return streaming || (profiling && onEndingTick);
  },

  shouldEmail() {
    return Profiler.type() === 'email' && Memory.profiler.disableTick === Game.time;
  },
};

function wrapFunction(name, originalFunction) {
  return function wrappedFunction() {
    const nameMatchesFilter = name === getFilter();
    const start = Game.cpu.getUsed();
    if (nameMatchesFilter) {
      depth++;
    }
    const result = originalFunction.apply(this, arguments);
    if (depth > 0 || !getFilter()) {
      const end = Game.cpu.getUsed();
      Profiler.record(name, end - start);
    }
    if (nameMatchesFilter) {
      depth--;
    }
    return result;
  };
}

function unprofileFunction(fn, functionName) {
  const fnName = functionName || fn.name;
  if (!fnName) {
    console.log('Couldn\'t find a function name for - ', fn);
    console.log('Will not profile this function.');
    return fn;
  }

  return unwrapFunction(fnName, fn);
}

function profileFunction(fn, functionName) {
  const fnName = functionName || fn.name;
  if (!fnName) {
    console.log('Couldn\'t find a function name for - ', fn);
    console.log('Will not profile this function.');
    return fn;
  }

  return wrapFunction(fnName, fn);
}

function unprofileObjectFunctions(object, label) {
  const objectToWrap = object.prototype ? object.prototype : object;

  Object.getOwnPropertyNames(objectToWrap).forEach(functionName => {
    const descriptor = Object.getOwnPropertyDescriptor(objectToWrap, functionName);
    const extendedLabel = `${label}.${functionName}`;
    if (descriptor.get) {
      descriptor.get = unprofileFunction(descriptor.get, extendedLabel);
    } else if (descriptor.set) {
      descriptor.set = unprofileFunction(descriptor.set, extendedLabel);
    } else {
      if (!descriptor.value ||
            typeof descriptor.value !== 'function' ||
            functionName === 'getUsed') {
        return;
      }
      objectToWrap[functionName] =
        unprofileFunction(objectToWrap[functionName], extendedLabel);
    }
  });

  return objectToWrap;
}

function profileObjectFunctions(object, label) {
  const objectToWrap = object.prototype ? object.prototype : object;

  Object.getOwnPropertyNames(objectToWrap).forEach(functionName => {
    const descriptor = Object.getOwnPropertyDescriptor(objectToWrap, functionName);
    const extendedLabel = `${label}.${functionName}`;
    if (descriptor.get) {
      descriptor.get = profileFunction(descriptor.get, extendedLabel);
    } else if (descriptor.set) {
      descriptor.set = profileFunction(descriptor.set, extendedLabel);
    } else {
      if (!descriptor.value ||
            typeof descriptor.value !== 'function' ||
            functionName === 'getUsed') {
        return;
      }
      objectToWrap[functionName] =
        profileFunction(objectToWrap[functionName], extendedLabel);
    }
  });

  return objectToWrap;
}

function hookUpPrototypes() {
  _.each(Profiler.prototypes, (proto) =>
    profileObjectFunctions(proto.val, proto.name)
  );
  _.each(Memory.profiler.registeredObjects, (r) =>
    profileObjectFunctions(r.val, r.name)
  );
  _.each(Memory.profiler.registeredFunctions, (r) =>
    profileFunction(r.val, r.name)
  );
}

function setupMemory(profileType, duration, filter) {
  if (!Memory.profiler) {
    hookUpPrototypes();
  }

  resetMemory();
  depth = 0; // reset depth, this needs to be done each tick.
  const startTime = Game.time + 1;
  Memory.profiler = {
    map: {},
    totalTime: 0,
    enabledTick: startTime,
    disableTick: startTime + duration,
    type: profileType,
    filter,
  };
}

function setupProfiler() {
  Game.profiler = {
    stream(duration, filter) {
      setupMemory('stream', duration || 10, filter);
    },
    email(duration, filter) {
      setupMemory('email', duration || 100, filter);
    },
    profile(duration, filter) {
      setupMemory('profile', duration || 100, filter);
    },
    reset: resetMemory,
  };

  overloadCPUCalc();
}

setupProfiler();

module.exports = {
  wrap(callback) {
    const callbackStart = Game.cpu.getUsed();
    const returnVal = callback();
    const callbackEnd = Game.cpu.getUsed();
    const callbackTime = callbackEnd - callbackStart;
    console.log(`CPU: callbackUsed=${callbackTime}`);

    if (Memory.profiler.enabledTick > 0) {
      Profiler.endTick();
      const profilerEnd = Game.cpu.getUsed();
      // const profilerTime = (profilerEnd - callbackEnd) + Memory.profiler.overhead;
      console.log(`CPU: profilerUsed=${profilerTime}`);
    }

    return returnVal;
  },
/*
  enable() {
    enabled = true;
    //hookUpPrototypes();
  },
*/
  registerObject(obj, label) {
    if (!Memory.profiler.registeredObjects) {
      Memory.profiler.registeredObjects = [];
    }
    Memory.profiler.registeredObjects.push({ val: obj, name: label });
    // return profileObjectFunctions(object, label);
  },

  registerFN(fn, label) {
    if (!Memory.profiler.registeredFunctions) {
      Memory.profiler.registeredFunctions = [];
    }
    Memory.profiler.registeredFunctions.push({ val: fn, name: label });
    // return profileFunction(fn, functionName);
  },
};
