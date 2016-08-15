const expect = require('chai').expect;
const JobHarvest = require('../src/job.harvest');
const u = require('../src/utils');

describe('Screep Harvest Job', () => {
  // Test parameters...
  const structure = new Structure();
  const job = new JobHarvest(structure, 0, null);

  describe('After Construction', () => {
    it('is of harvest type', () => {
      expect(job.type).to.equal(JobHarvest.TYPE);
    });
    it('has the expected structure', () => {
      expect(job.site === structure);
    });
    it('has the expected instance', () => {
      expect(job.instance === 0);
    });
  });
});
