const Path = require('path');
const AppModulePath = require('app-module-path');

AppModulePath.addPath(`${Path.resolve()}/src`);
AppModulePath.addPath(`${Path.resolve()}/lib`);

global._ = require('lodash');
global.ConstructionSite = require('screeps/ConstructionSite.js');
global.Creep = require('screeps/Creep.js');
global.Mineral = require('screeps/Mineral.js');
global.Resource = require('screeps/Resource.js');
global.Room = require('screeps/Room.js');
global.RoomPosition = require('screeps/RoomPosition.js');
global.Source = require('screeps/Source.js');
global.Structure = require('screeps/Structure.js');
global.StructureTower = require('screeps/Structures/StructureTower.js');
require('screeps/Global/Constants.js');
