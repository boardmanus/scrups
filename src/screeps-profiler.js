let usedOnStart = 0;
let enabled = false;
let depth = 0;

function setupProfiler() {
  depth = 0; // reset depth, this needs to be done each tick.
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




function getFilter() {
  return Memory.profiler.filter;
}


function wrapMethod(obj, label, functionName) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, functionName);

  let originalFunction;
  if (descriptor.get) {
    originalFunction = descriptor.get;
  } else if (descriptor.set) {
    originalFunction = descriptor.set;
  } else {
    if (descriptor.value === null ||
        typeof descriptor.value !== 'function' ||
        functionName === 'getCpu') {
      return;
    }
    originalFunction = obj[functionName];
  }

  const name = `${label}.${functionName}`;
  const filter = getFilter();
  const nameMatchesFilter = !filter || name === filter;

  function wrappedMethod() {
    if (nameMatchesFilter) {
      depth++;
    }

    const start = Game.cpu.getUsed();
    const result = originalFunction.apply(this, arguments);
    const end = Game.cpu.getUsed();

    if (nameMatchesFilter) {
      depth--;
      Profiler.record(name, end - start);
    }

    if (Profiler.finished()) {
      // Unwrap the function...
      if (descriptor.get) {
        descriptor.get = originalFunction;
      } else if (descriptor.set) {
        descriptor.set = originalFunction;
      } else {
        obj[functionName] = originalFunction;
      }
    }

    return result;
  }

  if (descriptor.get) {
    descriptor.get = wrappedMethod;
  } else if (descriptor.set) {
    descriptor.set = wrappedMethod;
  } else {
    obj[functionName] = wrappedMethod;
  }
}

function profileFunction(fn, functionName) {
  const fnName = functionName || fn.name;
  if (!fnName) {
    console.log('Couldn\'t find a function name for - ', fn);
    console.log('Will not profile this function.');
    return fn;
  }

  return wrapFunction(null, fnName, fn);
}

function profileObjectFunctions(object, label) {
  const objectToWrap = object.prototype ? object.prototype : object;

  _.each(Object.getOwnPropertyNames(objectToWrap), (functionName) => {
    wrapFunction(objectToWrap, label, functionName);
  });

  return objectToWrap;
}

function hookUpPrototypes() {
  Profiler.prototypes.forEach(proto => {
    profileObjectFunctions(proto.val, proto.name);
  });
}


}

function setupProfiler(profileType, duration, filter) {
  resetMemory();
  Memory.profiler = {
    map: {},
    totalTime: 0,
    enabledTick: Game.time,
    disableTick: Game.time + duration,
    type: profileType,
    filter,
  };
  hookupPrototypes();
}

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

function wrapFunction(name, originalFunction) {
  return function wrappedFunction() {
    if (Profiler.isProfiling()) {
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
    }

    return originalFunction.apply(this, arguments);

function monkeyPatch() {
      setupProfiler('stream', duration || 10, filter);
    },
    email(duration, filter) {
      setupProfiler('email', duration || 100, filter);
    },
    profile(duration, filter) {
      setupProfiler('profile', duration || 100, filter);
    },
    reset: resetMemory,
  };
}

function hookUpPrototypes() {
  Profiler.prototypes.forEach(proto => {
    profileObjectFunctions(proto.val, proto.name);
  });
}

function profileObjectFunctions(object, label) {
  const objectToWrap = object.prototype ? object.prototype : object;

  Object.getOwnPropertyNames(objectToWrap).forEach(functionName => {
    const extendedLabel = `${label}.${functionName}`;
    try {
      if (typeof objectToWrap[functionName] === 'function' && functionName !== 'getUsed') {
        const originalFunction = objectToWrap[functionName];
        objectToWrap[functionName] = profileFunction(originalFunction, extendedLabel);
      }
    } catch (e) { } /* eslint no-empty:0 */
  });

  return objectToWrap;
}

function profileFunction(fn, functionName) {
  const fnName = functionName || fn.name;
  if (!fnName) {
    console.log('Couldn\'t find a function name for - ', fn);
    console.log('Will not profile this function.');
    return fn;
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
      `Percentage: ${Memory.profiler.totalTime / elapsedTicks / Game.cpu.limit.toFixed(2)}`,
    ].join('\t');
    return [].concat(header, Profiler.lines().slice(0, 50), footer).join('\n');
  },

  lines() {
    const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
    const stats = Object.keys(Memory.profiler.map).map(functionName => {
      const functionCalls = Memory.profiler.map[functionName];
      return {
        name: functionName,
        calls: functionCalls.calls,
        totalTime: functionCalls.time,
        averageTime: functionCalls.time / functionCalls.calls,
        percentage: functionCalls.time / Game.cpu.limit * 100
      };
    }).sort((val1, val2) => {
      return val2.totalTime - val1.totalTime;
    });

    const lines = stats.map(data => {
      return [
        data.calls,
        data.totalTime.toFixed(1),
        data.averageTime.toFixed(3),
        data.percentage.toFixed(2),
        data.name,
      ].join('\t\t');
    });

    return lines;
  },

  prototypes: [
    {name: 'Game', val: Game},
    {name: 'Room', val: Room},
    {name: 'Structure', val: Structure},
    {name: 'Spawn', val: Spawn},
    {name: 'Creep', val: Creep},
    {name: 'RoomPosition', val: RoomPosition},
    {name: 'Source', val: Source},
    {name: 'Flag', val: Flag}
  ],

  functions: [],

  record(functionName, time) {
    if (!Memory.profiler.map[functionName]) {
      Memory.profiler.map[functionName] = {
        time: 0,
        calls: 0
      };
    }
    Memory.profiler.map[functionName].calls++;
    Memory.profiler.map[functionName].time += time;
  },

  endTick() {
    if (!Memory.profiler) {
      return;
    }

    if (Game.time >= Memory.profiler.enabledTick) {
      const cpuUsed = Game.cpu.getUsed();
      Memory.profiler.totalTime += cpuUsed;
      if (isFinished()) {
        switch (Profiler.type()) {
          case 'stream': Profiler.printProfile();
          case ''
        }

        delete Memory.profiler;
      }
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

  isFinished() {
    return !!Memory.profiler && Game.time >= Memory.profiler.disableTick;
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
  }
};

const ProfilerApi = {
  wrap(callback) {
    const profilerStart = Game.cpu.getUsed();
    monkeyPatch();

    // reset depth, this needs to be done each tick.
    depth = 0;

    const callbackStart = Game.cpu.getUsed();
    const returnVal = callback();
    const callbackEnd = Game.cpu.getUsed();
    Profiler.endTick();

    const callbackTime = callbackEnd - callbackStart;
    const end = Game.cpu.getUsed();

    const totalTime = end - profilerStart;
    const profilerTime = totalTime - callbackTime;
    console.log(`CPU: callback=${callbackTime}, profiler=${profilerTime}, total=${totalTime}`);
    return returnVal;
  },

  registerClass(clazz, label) {
    return Profiler.prototypes.push({name: label, val: clazz});
  },

  registerFN(fn, functionName) {
    return Profiler.functions.push({name: fn, val: functionName});
  },
};


module.exports = ProfilerApi;
