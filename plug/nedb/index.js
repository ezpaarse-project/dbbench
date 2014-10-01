'use strict';

var fs        = require('fs');
var path      = require('path');
var Datastore = require('nedb');

var dbFile    = path.join(__dirname, 'base.db')
var db        = new Datastore({ filename: dbFile });

exports.name = 'NeDB';

exports.init = function (callback) {
  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      db.loadDatabase(callback);
    }
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  db.insert(entry, callback);
};

exports.get = function (id, callback) {
  db.findOne({ _id: id }, callback);
};
