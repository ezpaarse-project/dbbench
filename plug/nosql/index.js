'use strict';

var fs     = require('fs');
var path   = require('path');

var dbFile = path.join(__dirname, 'base.nosql');
var db     = require('nosql');
var nosql;

exports.name = 'NoSQL';

exports.init = function (callback) {
  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      nosql = db.load(dbFile).on('load', callback);
    }
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  nosql.insert(entry, function (count) {
    callback(null, count);
  });
};

exports.get = function (id, callback) {
  nosql.one(function (entry) {
    if (entry._id == id) { return entry; }
  }, function (doc) {
    callback(null, doc);
  });
};
