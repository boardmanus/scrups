const assert = require('chai').assert;
const JobHarvest = require('job.harvest');
const u = require('utils');

describe('Screep Harvest Job', () => {
  // Test parameters...
  const source = new Source();
  const mineral = new Mineral();
  const job = new JobHarvest(source, 0, null);

  describe('After Construction', function() {
    it('is of harvest type', () => {
      assert(job.type === JobHarvest.TYPE, "Unexpected Job type after construction");
    });
    it('has the expected structure', function() {
      assert(job.site === source, "Unexpected site after construction");
    });
    it('has the expected instance', function() {
      assert(job.instance === 0, "Unexpected instance after construction");
    });
  });

  describe('Reports the the expected priority', function() {
    it('has lower priority if the site has less resources', function() {

    });
  });
});
