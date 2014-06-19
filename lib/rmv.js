'use strict';

var async = require('async');
var debug = require('debug')('s3-tools');

var lsv = require('./lsv');

module.exports = function (s3, opts, cb) {
  lsv(s3, opts, function (err, data) {
    if (err) return cb(err);
    debug('removing the objects', data.Versions.length +
      data.DeleteMarkers.length);

    var allDeleted = [];
    var allErrors = [];
    var files = data.Versions.reduce(returnIfLatest, []);
    files = data.DeleteMarkers.reduce(returnIfLatest, files);
    function returnIfLatest (list, key) {
      if (key.IsLatest || opts['rmv-all']) {
        list.push({
          Key: key.Key,
          VersionId: key.VersionId,
        });
      }
      return list;
    }

    function isEmpty () { return files.length > 0; }
    function removeObjects (cb) {
      var deleteObjects = [];
      if (files.length > 1000) {
        deleteObjects = files.splice(0, 1000);
      } else {
        deleteObjects = files.splice(0, files.length);
      }
      debug('removing objects...', deleteObjects.length);
      s3.deleteObjects({
        Bucket: opts.Bucket,
        Delete: { Objects: deleteObjects }
      }, function (err, data) {
        if (err) return cb(err);
        allDeleted.push.apply(allDeleted, data.Deleted);
        allErrors.push.apply(allErrors, data.Errors);
        cb();
      });
    }
    function combineResponses (err) {
      if (err) return cb(err);
      cb(null, {
        Deleted: allDeleted,
        Errors: allErrors
      });
    }

    debug('starting up rmv');
    async.whilst(
      isEmpty,
      removeObjects,
      combineResponses
    );
  });
};
