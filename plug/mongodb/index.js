'use strict';

var mongo = require('mongodb').MongoClient;
var db;
var collection;

exports.name = 'MongoDB';

exports.init = function (options, callback) {

  mongo.connect(options.database || 'mongodb://127.0.0.1:27017/dbbench', function (err, database) {
    if (err) { return callback(err); }

    db = database;
    db.collection('items').drop();
    collection = db.collection('items');

    callback();
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  collection.insert(entry, { w: 0 }, callback);
};

exports.get = function (id, callback) {
  collection.findOne({ _id: id }, callback);
};

exports.close = function () { db.close(); }