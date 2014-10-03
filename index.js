'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    b: ['database', 'db'],
    s: ['db-size', 'size'],
    t: ['duration'],
    o: ['options'],
    l: ['db-list', 'list'],
    v: ['verbose'],
    d: ['debug']
  },
  default: {
    s: 5000,
    t: 5
  }
});

if (argv.list) {
  var path    = require('path');
  var fs      = require('fs');
  var plugDir = path.join(__dirname, 'plug');

  fs.readdir(plugDir, function (err, items) {
    if (err) { throw err; }

    (function list() {
      var item = items.pop();
      if (!item) { return; }

      fs.stat(path.join(plugDir, item), function (err, stat) {
        if (err) { console.error(err); }
        if (stat && stat.isDirectory()) { console.log(item); }
        list();
      });
    })();
  });
  return;
}

if (!argv.db) {
  console.error('No database provided');
  process.exit(1);
}

var faker = require('faker');
var db    = require('./plug/' + argv.db + '/index.js');

var id = 0;

function generate(callback) {
  var inserted  = 0;
  var errors    = 0;

  (function insert() {
    if (id >= argv.size) {
      return callback(null, {
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
      if (err) {
        errors++;
        if (argv.debug) { console.error(err); }
      } else {
        inserted++;
      }

      setImmediate(insert);
    });
  })();
};

function bench(callback) {
  var stop        = false;
  var nbQueries   = 0;
  var nbNotFound  = 0;
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

      if (err) {
        nbErrors++;
        if (argv.debug) { console.error(err); }
      } else {
        nbQueries++
        if (entry) {
          if (argv.verbose) { console.log(entry); }
        } else {
          nbNotFound++;
        }
      }

      if (stop) {
        callback(null, {
          queries: nbQueries,
          errors: nbErrors,
          notFound: nbNotFound,
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
db.init(argv.options ? JSON.parse(argv.options) : {}, function (err) {
  if (err) { throw err; }

  var startTime = process.hrtime();
  console.log('Generating dataset...');

  generate(function (err, res) {

    var elapsed = process.hrtime(startTime);
    elapsed = (elapsed[0] * 1e9 + elapsed[1]) / 1e6;

    var genMin = Math.floor(elapsed / 60000).toString();
    var genSec = Math.floor(elapsed % 60000 / 1000).toString();
    if (genMin.length == 1) { genMin = '0' + genMin; }
    if (genSec.length == 1) { genSec = '0' + genSec; }

    startTime = process.hrtime();
    console.log('Starting bench');

    bench(function (err, result) {

      elapsed = process.hrtime(startTime);
      elapsed = (elapsed[0] * 1e9 + elapsed[1]) / 1e6;
      var benchMin = Math.floor(elapsed / 60000).toString();
      var benchSec = Math.floor(elapsed % 60000 / 1000).toString();
      if (benchMin.length == 1) { benchMin = '0' + benchMin; }
      if (benchSec.length == 1) { benchSec = '0' + benchSec; }

      console.log('Bench finished in %d minutes and %d seconds\n', benchMin, benchSec);

      var queriesPerSecond = Math.round(result.queries / argv.duration);

      console.log('Dataset');
      console.log('  Inserted: \t%d', res.inserted);
      console.log('  Failed: \t%d', res.errors);
      console.log('  Time: \t%s:%s', genMin, genSec);

      console.log('Queries');
      console.log('  Performed: \t%d (%d per second)', result.queries, queriesPerSecond);
      console.log('  Not found: \t%d', result.notFound);
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