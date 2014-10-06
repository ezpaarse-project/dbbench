dbbench
=======

A basic benching tool to compare node.js embedded databases. It inserts randomly generated objects with string identifiers, then queries random identifiers for a given period of time.

## Installation
```bash
  git clone https://github.com/ezpaarse-project/dbbench.git dbbench
  cd dbbench
  npm install
```
## Usage

```javascript
  node index.js --db=[String] [-stoldv]
```

#### Options

* `[b][db][database]` {string} database type to bench (matching folder name in `plug` directory) [required].
* `[s][size][db-size]` {Integer} number of entries to insert in the database (defaults to `5000`).
* `[t][duration]` {Integer} bench duration in seconds (defaults to `5`).
* `[o][options]` {JSON} database specific options, if available.
* `[l][list][db-list]` list available database types.
* `[d][debug]` show errors when queries (insert or find) fail.
* `[v][verbose]` print entries that are successfuly found (not suitable for real benching).
