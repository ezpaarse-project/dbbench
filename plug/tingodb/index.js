'use strict';

var fs   = require('fs');
var path = require('path');

var dbDir = path.join(__dirname, 'db');
var db;
var collection;

exports.name = 'TingoDB';

exports.init = function (options, callback) {
  var TingoDB = require('tingodb')(options).Db;

  fs.mkdir(dbDir, function (err) {
    if (err && err.code != 'EEXIST') { return callback(err); }

    fs.unlink(path.join(dbDir, 'items'), function (err) {
      if (err && err.code != 'ENOENT') {
        callback(err);
      } else {
        db = new TingoDB(dbDir, {});
        db.collection('items', function (err, items) {
          collection = items;
          callback(err);
        });
      }
    });
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  collection.insert(entry, callback);
};

exports.get = function (id, callback) {
  collection.findOne({ _id: id }, callback);
};
