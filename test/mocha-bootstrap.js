const Path = require('path');
const AppModulePath = require('app-module-path');

AppModulePath.addPath(`${Path.resolve()}/src`);
AppModulePath.addPath(`${Path.resolve()}/lib`);

global._ = require('lodash');
global.Creep = require('screeps/Creep.js');
global.Structure = require('screeps/Structure.js');
global.Mineral = require('screeps/Mineral.js');
global.Source = require('screeps/Source.js');
global.StructureTower = require('screeps/Structures/StructureTower.js');
require('screeps/Global/Constants.js');
