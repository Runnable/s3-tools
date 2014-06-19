'use strict';

var debug = require('debug')('s3-tools');

module.exports = function (s3, opts, cb) {
  debug('starting up lb');
  s3.listBuckets(cb);
};
