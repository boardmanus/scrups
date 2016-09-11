const Path = require('path');
const AppModulePath = require('app-module-path');

AppModulePath.addPath(`${Path.resolve()}/src`);
AppModulePath.addPath(`${Path.resolve()}/lib`);

global._ = require('lodash');

global.Game = require('screeps/Game.js');
global.Room = require('screeps/Room.js');
global.RoomObject = require('screeps/RoomObject.js');
global.RoomPosition = require('screeps/RoomPosition.js');

global.ConstructionSite = require('screeps/ConstructionSite.js');
global.Creep = require('screeps/Creep.js');
global.Flag = require('screeps/Flag.js');
global.Mineral = require('screeps/Mineral.js');
global.Resource = require('screeps/Resource.js');
global.Source = require('screeps/Source.js');

global.Structure = require('screeps/Structure.js');
global.OwnedStructure = require('screeps/OwnedStructure.js');

global.StructureContainer = require('screeps/Structures/StructureContainer.js');
global.StructureController = require('screeps/Structures/StructureController.js');
global.StructureExtension = require('screeps/Structures/StructureExtension.js');
global.StructureLink = require('screeps/Structures/StructureLink.js');
global.StructureSpawn = require('screeps/Structures/StructureSpawn.js');
global.StructureStorage = require('screeps/Structures/StructureStorage.js');
global.StructureTower = require('screeps/Structures/StructureTower.js');

require('screeps/Global/Constants.js');
