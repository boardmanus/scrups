const expect = require('chai').expect;
const Job = require('../src/job');
const u = require('../src/utils');

describe('Screep Job', () => {
  // Test parameters...
  const type = 'my-job-type';
  const structure = new Structure();
  const job = new Job(type, structure);

  describe('After Construction', () => {
    it('has the expected properties', () => {
      expect(job.type).to.equal(type);
      expect(job.site).to.equal(structure);
    });
    it('has an info value with the type and site name', () => {
      const info = job.info();
      expect(info).to.contain(type);
      expect(info).to.contain(u.name(structure));
    });
  });
});
