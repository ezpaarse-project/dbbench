dbbench
=======

A basic benching tool to compare databases

## Installation
```bash
  git clone https://github.com/ezpaarse-project/dbbench.git dbbench
  cd dbbench
  npm install
```
## Usage

```javascript
  node index.js --db=[String] [-sd]
```

#### Options

* `[b][db][database]` {string} database type to bench (matching folder name in `plug` directory) [required].
* `[s][size][db-size]` {Integer} number of entries to insert in the database (defaults to `5000`).
* `[d][duration]` {Integer} bench duration in seconds (defaults to `5`).
* `[l][list][db-list]` list available database types.
