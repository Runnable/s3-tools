'use strict';

// var debug = require('debug')('s3-tools');
var pick = require('101/pick');

module.exports = function (s3, opts, cb) {
  s3.getObject(pick(opts, ['Bucket', 'Key', 'VersionId']), cb);
};
