'use strict';

var fs   = require('fs');
var path = require('path');
var low  = require('lowdb');

low.mixin(require('underscore-db'))

var dbFile = path.join(__dirname, 'base.json');
var db;
var collection;

exports.name = 'LowDB';

exports.init = function (options, callback) {
  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      db = low(dbFile);
      collection = db('items');
      callback();
    }
  });
};

exports.insert = function (id, entry, callback) {
  entry.id = id;
  collection.insert(entry);
  callback();
};

exports.get = function (id, callback) {
  callback(null, collection.get(id).value());
};
