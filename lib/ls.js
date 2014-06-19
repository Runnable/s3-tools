'use strict';

var async = require('async');
var debug = require('debug')('s3-tools');
var pick = require('101/pick');
var last = require('101/last');

module.exports = function (s3, opts, cb) {
  if (opts.Key) listSingleKey(s3, opts, cb);
  else listAllObjects(s3, opts, cb);
};

function listSingleKey (s3, opts, cb) {
  var req = pick(opts, ['Bucket', 'Key']);
  s3.headObject(req, function (err, data) {
    if (err) return cb(err);
    data.Key = opts.Key;
    cb(null, {
      Contents: [ data ],
      CommonPrefixes: []
    });
  });
}

function listAllObjects (s3, opts, cb) {
  var IsTruncated = true;
  var NextMarker = false;
  var allData = [];
  var allPrefixes = [];
  var lastData = [];

  function isTruncated () { return IsTruncated; }
  function downloadObjectList (cb) {
    var req = pick(opts, ['Bucket', 'Prefix', 'Delimiter']);
    if (NextMarker) req.Marker = NextMarker;
    s3.listObjects(req, function (err, data) {
      if (err) return cb(err);
      IsTruncated = data.IsTruncated;
      NextMarker = IsTruncated ? last(data.Contents).Key : false;
      allData.push.apply(allData, data.Contents);
      allPrefixes.push.apply(allPrefixes, data.CommonPrefixes);
      delete data.Contents;
      delete data.CommonPrefixes;
      lastData = data;
      cb();
    });
  }
  function combineAllData (err) {
    if (err) return cb(err);
    debug('got all the data', allData.length);
    lastData.Contents = allData;
    lastData.CommonPrefixes = allPrefixes;
    cb(null, lastData);
  }

  debug('starting up ls');
  async.whilst(
    isTruncated,
    downloadObjectList,
    combineAllData
  );
}
