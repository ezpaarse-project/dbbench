'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    b: ['database', 'db'],
    s: ['db-size', 'size'],
    d: ['duration']
  },
  default: {
    s: 5000,
    d: 5000
  }
});

if (!argv.db) {
  console.error('No database provided');
  process.exit(1);
}

var faker = require('faker');
var db    = require('./plug/' + argv.db + '/index.js');

var id = 0;

function init(callback) {
  db.init(callback);
};

function generate(callback) {
  var startTime = process.hrtime();
  var inserted  = 0;
  var errors    = 0;

  (function insert() {
    if (id >= argv.size) {
      var elapsed = process.hrtime(startTime);

      return callback(null, {
        elapsed: Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6),
        inserted: inserted,
        errors: errors
      });
    }

    db.insert('identifier' + id++, {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      zipcode: faker.address.zipCode(),
      city: faker.address.city(),
      country: faker.address.country()
    }, function (err) {
      if (err) { errors++; }
      else     { inserted++; }

      insert();
    });
  })();
};

function bench(callback) {
  var stop        = false;
  var nbQueries   = 0;
  var nbErrors    = 0;
  var maxTime     = 0;
  var minTime     = Infinity;
  var averageTime = 0;

  (function query() {
    var id = 'identifier' + (Math.floor(Math.random() * argv.size));
    var startTime = process.hrtime();

    db.get(id, function (err, entry) {
      var elapsed = process.hrtime(startTime);
      elapsed = elapsed[0] * 1e9 + elapsed[1];

      minTime = Math.min(minTime, elapsed);
      maxTime = Math.max(minTime, elapsed);
      averageTime = averageTime ? (averageTime + elapsed) / 2 : elapsed;

      if (err) {
        nbErrors++;
      } else {
        nbQueries++
      }

      if (stop) {
        callback(null, {
          queries: nbQueries,
          errors: nbErrors,
          minTime: Math.round(minTime / 1e3) / 1e3,
          maxTime: Math.round(maxTime / 1e3) / 1e3,
          averageTime: Math.round(averageTime / 1e3) / 1e3
        });
      } else {
        setImmediate(query);
      }
    });
  })();

  setTimeout(function() { stop = true; }, argv.duration);
};

console.log('[ %s ]', db.name);
console.log('Initializing database...');
init(function () {
  var startTime = process.hrtime();

  console.log('Generating dataset...');
  generate(function (err, res) {

    console.log('Starting bench');
    bench(function (err, result) {
      console.log('Bench finished\n');

      console.log('Dataset');
      console.log('  Inserted: \t%d', res.inserted);
      console.log('  Failed: \t%d', res.errors);
      console.log('  Loaded in: \t%dms', res.elapsed);

      console.log('Queries');
      console.log('  Successful: \t%d', result.queries);
      console.log('  Failed: \t%d', result.errors);

      console.log('Query time')
      console.log('  Minimum : \t%dms', result.minTime);
      console.log('  Maximum : \t%dms', result.maxTime);
      console.log('  Average : \t%dms', result.averageTime);
    });
  });
});