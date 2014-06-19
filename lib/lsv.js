'use strict';

var async = require('async');
var debug = require('debug')('s3-tools');
var pick = require('101/pick');

module.exports = function (s3, opts, cb) {
  var IsTruncated = true;
  var NextMarker = false;
  var NextVersionMarker = false;
  var allVersions = [];
  var allDeleteMarkers = [];
  var allPrefixes = [];
  var lastData = [];

  function isTruncated () { return IsTruncated; }
  function downloadObjectList (cb) {
    var req = pick(opts, ['Bucket', 'Prefix', 'Delimiter']);
    if (opts.Key) {
      req.MaxKeys = 1;
      req.Prefix = opts.Key || opts.Prefix;
    }
    if (NextMarker) req.KeyMarker = NextMarker;
    if (NextVersionMarker) req.VersionIdMarker = NextVersionMarker;
    debug('getting object list...', IsTruncated, NextMarker, NextVersionMarker);
    s3.listObjectVersions(req, function (err, data) {
      if (err) return cb(err);
      IsTruncated = data.IsTruncated;
      NextMarker = IsTruncated ? data.NextKeyMarker : false;
      NextVersionMarker = IsTruncated ? data.NextVersionIdMarker : false;
      allVersions.push.apply(allVersions, data.Versions);
      allDeleteMarkers.push.apply(allDeleteMarkers, data.DeleteMarkers);
      allPrefixes.push.apply(allPrefixes, data.CommonPrefixes);
      delete data.Versions;
      delete data.DeleteMarkers;
      delete data.CommonPrefixes;
      lastData = data;
      cb();
    });
  }
  function combineallVersions (err) {
    if (err) return cb(err);
    debug('got all the data', allVersions.length + allDeleteMarkers.length);
    lastData.Versions = allVersions;
    lastData.DeleteMarkers = allDeleteMarkers;
    lastData.CommonPrefixes = allPrefixes;
    cb(null, lastData);
  }

  debug('starting lsv');
  async.whilst(
    isTruncated,
    downloadObjectList,
    combineallVersions
  );
};
