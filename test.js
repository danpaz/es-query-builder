var Builder = require('./index.js');
var chai = require('chai');
var expect = chai.expect;

describe('Builder', function () {

  it('should work', function () {
    var subject = new Builder({
      index: 'myindex'
    });

    var result = subject
      .sort('asc')
      .size(25)
      .query({
         match: { tweet: 'full text search' }
       })
      .filter('must', {
         range: { created: { gte: 'now-1d/d' } }
       })
      .filter('should', {
         term: { featured: true }
       })
      .filter('should', {
         term: { starred: true }
       })
      .filter('must_not', {
         term: { deleted: false }
       })
      .toQuery();

    expect(result).to.eql({
      index: 'myindex',
      body: {
        sort: 'asc',
        size: 25,
        query: {
          filtered: {
            query: {
              match: { tweet: 'full text search' }
            },
            filter: {
              bool: {
                must: [{ range: { created: { gte: 'now-1d/d' }}}],
                should: [
                  { term: { featured: true } },
                  { term: { starred:  true } }
                ],
                must_not: [{ term: { deleted: false } }]
              }
            },
            aggs: {}
          }
        }
      }
    });
  });

  it('should accept an options hash', function () {
    var subject = new Builder({index: 'myindex'});
    var result = subject.toQuery();
    expect(result).to.eql({
      index: 'myindex',
      body: {}
    });
  });

  it('should use sensible defaults', function () {
    var subject = new Builder();
    var result = subject.toQuery();
    expect(result).to.eql({
      index: '*',
      body: {}
    });
  });

  it('should set a query sort', function () {
    var subject = new Builder();
    var result = subject.sort('asc').toQuery();
    expect(result.body.sort).to.equal('asc');
  });

  it('should set a query size', function () {
    var subject = new Builder();
    var result = subject.size(10).toQuery();
    expect(result.body.size).to.equal(10);
  });

  it('should add a new filter', function () {
    var subject = new Builder();
    var result = subject.filter('must', {
      match: { tweet: 'full text search' }
    }).toQuery();
    expect(result.body.query).to.eql({
      filtered: {
        query: {},
        aggs: {},
        filter: {
          bool: {
            must: [
              {
                match: {
                  tweet: 'full text search'
                }
              }
            ]
          }
        }
      }
    });
  });

  it('should add multiple filters', function () {
    var subject = new Builder();
    var result = subject.filter('must', {
      match: { tweet: 'full text search' }
    }).filter('must', {
      match: { tweet: 'another string' }
    }).toQuery();
    expect(result.body.query).to.eql({
      filtered: {
        query: {},
        aggs: {},
        filter: {
          bool: {
            must: [
              {
                match: {
                  tweet: 'full text search'
                }
              },
              {
                match: {
                  tweet: 'another string'
                }
              }
            ]
          }
        }
      }
    });
  });

  it('should add a new query', function () {
    var subject = new Builder();
    var result = subject.query({
      match: { tweet: 'full text search' }
    }).toQuery();
    expect(result.body.query).to.eql({
      filtered: {
        query: {
          match: {
            tweet: 'full text search'
          }
        },
        aggs: {},
        filter: {}
      }
    });
  });

});
