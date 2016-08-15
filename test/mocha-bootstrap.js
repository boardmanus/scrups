const path = require('path');
require('app-module-path').addPath(`${path.resolve()}/src`);

global.Creep = require('../screeps/Creep.js');
global.Structure = require('../screeps/Structure.js');
global.Mineral = require('../screeps/Mineral.js');
global.Mineral = require('../screeps/Source.js');
