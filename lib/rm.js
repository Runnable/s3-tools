'use strict';

var async = require('async');
var debug = require('debug')('s3-tools');

var ls = require('./ls');

module.exports = function (s3, opts, cb) {
  ls(s3, opts, removeTheObjects);

  function removeTheObjects (err, data) {
    if (err) return cb(err);
    debug('removing the objects', data.Contents.length);

    var allDeleted = [];
    var allErrors = [];
    var files = data.Contents.map(function (file) {
      return { Key: file.Key };
    });

    function isEmpty () { return files.length > 0; }
    function removeObjects (cb) {
      var deleteObjects = [];
      if (files.length > 1000) {
        deleteObjects = files.splice(0, 1000);
      } else {
        deleteObjects = files.splice(0, files.length);
      }
      debug('removing objects...');
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
      cb({
        Deleted: allDeleted,
        Errors: allErrors
      });
    }

    debug('starting rm');
    async.whilst(
      isEmpty,
      removeObjects,
      combineResponses
    );
  }
};
