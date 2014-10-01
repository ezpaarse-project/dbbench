'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    b: ['database', 'db'],
    s: ['db-size', 'size'],
    d: ['duration']
  },
  default: {
    s: 5000,
    d: 5
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

      setImmediate(insert);
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
  var maxMemory   = 0;
  var minMemory   = Infinity;

  (function query() {
    var id = 'identifier' + (Math.floor(Math.random() * argv.size));
    var startTime = process.hrtime();

    var memoryUsage = process.memoryUsage().rss;
    minMemory = Math.min(minMemory, memoryUsage);
    maxMemory = Math.max(maxMemory, memoryUsage);


    db.get(id, function (err, entry) {
      var elapsed = process.hrtime(startTime);
      elapsed = elapsed[0] * 1e9 + elapsed[1];

      minTime = Math.min(minTime, elapsed);
      maxTime = Math.max(maxTime, elapsed);
      averageTime = averageTime ? (averageTime + elapsed) / 2 : elapsed;

      if (err) { nbErrors++; }
      else     { nbQueries++ }

      if (stop) {
        callback(null, {
          queries: nbQueries,
          errors: nbErrors,
          time: {
            min: Math.round(minTime / 1e3) / 1e3,
            max: Math.round(maxTime / 1e3) / 1e3,
            average: Math.round(averageTime / 1e3) / 1e3
          },
          memory: {
            min: Math.round(minMemory / 1024 / 1024 * 100) / 100,
            max: Math.round(maxMemory / 1024 / 1024 * 100) / 100
          }
        });
      } else {
        setImmediate(query);
      }
    });
  })();

  setTimeout(function() { stop = true; }, argv.duration * 1000);
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

      var queriesPerSecond = Math.round(result.queries / argv.duration);

      console.log('Dataset');
      console.log('  Inserted: \t%d', res.inserted);
      console.log('  Failed: \t%d', res.errors);
      console.log('  Time: \t%d ms', res.elapsed);

      console.log('Queries');
      console.log('  Successful: \t%d (%d per second)', result.queries, queriesPerSecond);
      console.log('  Failed: \t%d', result.errors);

      console.log('Queries time')
      console.log('  Minimum: \t%d ms', result.time.min);
      console.log('  Maximum: \t%d ms', result.time.max);
      console.log('  Average: \t%d ms', result.time.average);

      console.log('Memory usage')
      console.log('  Minimum: \t%d MiB', result.memory.min);
      console.log('  Maximum: \t%d MiB', result.memory.max);
    });
  });
});