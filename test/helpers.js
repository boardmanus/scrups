const Sinon = require('sinon');


const Helpers = {
  stubGetObjectById(testId, gameObj) {
    const stub = Sinon.stub(Game, 'getObjectById', (id) => {
        if (id !== testId) {
          return null;
        }
        gameObj.id = id;
        return gameObj;
      });
      return stub;
    },

    unstubGetObjectById() {
      Game.getObjectById.restore();
    }
};

module.exports = Helpers;
