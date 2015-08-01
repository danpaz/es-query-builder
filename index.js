//
// Sample query:
//
// {
//   index: 'myindex',
//   body: {
//     sort: 'asc',
//     size: 25,
//     query: {
//       filtered: {
//         "query": {
//           "match": { "tweet": "full text search" }
//         },
//         "filter": {
//           "bool": {
//             "must": { "range": { "created": { "gte": "now-1d/d" }}},
//             "should": [
//               { "term": { "featured": true }},
//               { "term": { "starred":  true }}
//             ],
//             "must_not": { "term": { "deleted": false }
//           }
//         },
//         "aggs": {}
//       }
//     }
//   }
// }
//

// Desired API to build the above query:
//
// var esQueryBuilder = require('esQueryBuilder');
// var query = esQueryBuilder({
//   index: 'myindex'
// });
//
// esQueryBuilder
//  .sort('asc')
//  .size(25)
//  .query(obj)
//  .filter('must', obj)
//  .filter('should', obj)
//  .filter('should', obj)
//  .filter('must_not', obj)
//  .toQuery();
//

var _ = require('lodash');

// Elasticsearch query builder.
//
function Builder(opts) {

  // Index-level properties.
  this.opts = _.defaults({}, opts, {index: '*'});

  // Body-level properties.
  this._bodyOpts = [];

  // Query-level properties.
  this._queries = [];
  this._filters = {};
  this._aggs = [];

}

/**
 * Convert the current query thus far to JSON.
 *
 * @return {Object} Query
 */
Builder.prototype.toQuery = function toQuery() {
  var body = this._body();
  var query = _.assign(this.opts, {body: body});
  return query;
};

/**
 * Convert the current query thus far to String.
 *
 * @return {String} Query stringified.
 */
Builder.prototype.toString = function toString() {
  return this.toQuery().toString();
};

/**
 * Return a hash of body options from an Array of hashes.
 *
 * @return {Object} Body options.
 */
Builder.prototype._body = function _body() {
  var queryBody = this._queryBody();
  var body = _.isEmpty(queryBody) ? {} : {query: queryBody};

  this._bodyOpts.forEach(function (opt) {
    _.assign(body, opt);
  });
  return body;
};

/**
 * Construct query body from filters, queries, aggs.
 *
 * @return {Object} Body options.
 */
Builder.prototype._queryBody = function _queryBody() {
  var queries = {};
  var aggs = {};
  var filters = this._filters;
  var queryBody;

  this._queries.forEach(function (query) {
    _.assign(queries, query);
  });

  this._aggs.forEach(function (agg) {
    _.assign(aggs, agg);
  });

  if (_.isEmpty(queries) && _.isEmpty(filters) && _.isEmpty(aggs)) {
    return {};
  }

  queryBody = {
    filtered: {
      query: queries,
      filter: filters,
      aggs: aggs,
    }
  };

  return queryBody;
};

/**
 * Add query sort to body options.
 *
 * @param  {String} val Typically 'asc' or 'desc'.
 * @return {Object}     Self.
 */
Builder.prototype.sort = function sort(val) {
  var sortOpt = {sort: val};
  this._bodyOpts.push(sortOpt);
  return this;
};

/**
 * Add query size to body options.
 *
 * @param  {Integer} val Number to limit query results.
 * @return {Object}      Self.
 */
Builder.prototype.size = function size(val) {
  var sizeOpt = {size: val};
  this._bodyOpts.push(sizeOpt);
  return this;
};

/**
 * Add query a new query.
 *
 * @param  {Integer} obj A fully formed query.
 * @return {Object}      Self.
 */
Builder.prototype.query = function query(obj) {
  this._queries.push(obj);
  return this;
};

/**
 * Add a new filter. Uses boolean filters to handle the most general case.
 *
 * @param  {String} bool 'must', 'must_not', 'should'.
 * @param  {Object} obj  A fully formed filter.
 * @return {Object}      Self.
 */
Builder.prototype.filter = function filter(bool, obj) {
  if (_.isEmpty(this._filters)) {
    this._filters = {bool: {}};
  }
  this._filters.bool[bool] = this._filters.bool[bool] || [];
  this._filters.bool[bool].push(obj);
  return this;
};

module.exports = Builder;
