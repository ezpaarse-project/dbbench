'use strict';

var PouchDB = require('pouchdb');
var db;

exports.name = 'PouchDB';

exports.init = function (options, callback) {
  PouchDB.destroy('items', function (err) {
    if (err) { return callback(err); }

    db = new PouchDB('items', options);
    callback();
  });
};

exports.insert = function (id, entry, callback) {
  db.put(entry, id, callback);
};

exports.get = function (id, callback) {
  db.get(id, callback);
};
