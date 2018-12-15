const { describe, it } = require('mocha');
const should = require('chai').should();
const { stats, metrics } = require('../lib/stats');
const fixtureCtx = require('../test/fixtures/stats/ctx');

describe('stats.js', () => {
  describe('stats.counter', () => {
    it('should count dau and received msg', () => {
      fixtureCtx.forEach((ctx) => {
        stats.counter(ctx);
      });
      metrics.should.eql({
        dau: 3,
        receivedMsg: 4,
      });
    });
  });
});
