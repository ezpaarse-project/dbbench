'use strict';


var db = {};

exports.name = 'Memory';

exports.init = function (callback) {
  callback();
};

exports.insert = function (id, entry, callback) {
  db[id] = entry;
  callback(null);
};

exports.get = function (id, callback) {
  var entry = db[id];

  if (entry) {
    callback(null, entry);
  } else {
    callback(new Error('ID not found'));
  }
};
