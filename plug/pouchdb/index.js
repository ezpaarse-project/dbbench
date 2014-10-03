'use strict';

var PouchDB = require('pouchdb');
var db;

var dbDir = require('path').join(__dirname, 'items');
exports.name = 'PouchDB';

exports.init = function (options, callback) {
  PouchDB.destroy(dbDir, function (err) {
    if (err) { return callback(err); }

    db = new PouchDB(dbDir, options);
    callback();
  });
};

exports.insert = function (id, entry, callback) {
  db.put(entry, id, callback);
};

exports.get = function (id, callback) {
  db.get(id, callback);
};
