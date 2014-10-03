'use strict';

var path   = require('path');
var rimraf = require('rimraf');
var fdb    = require('final-db');

var dbDir = path.join(__dirname, 'db');
var collection;

exports.name = 'FinalDB';

exports.init = function (options, callback) {
  rimraf(dbDir, function (err) {
    if (err) { return callback(err); }

    collection = new fdb.Collection({ dirName: dbDir });
    callback();
  });
};

exports.insert = function (id, entry, callback) {
  entry.id = id;
  collection.insert(entry);
  collection.flush().then(function () { callback(); });
};

exports.get = function (id, callback) {
  collection.find(id).then(function (user) {
    callback(null, user);
  });
};
