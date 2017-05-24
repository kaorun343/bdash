import sqlite3 from 'sqlite3';

export default class Connection {
  get db() {
    if (!this._db) {
      throw new Error('Database is not initialized.');
    }

    return this._db;
  }

  async initialize({ databasePath, schema }) {
    this._db = new sqlite3.Database(databasePath);
    await this.exec(schema);
    await this.migrate();
  }

  async migrate() {
    // TODO: Improve migration process
    try {
      await this.exec('alter table queries add column uuid text');
    }
    catch (e) {
      // do nothing
      console.log(e);
    }
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, err => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  get(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }

  all(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }

  insert(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function(err) {
        if (err) {
          reject(err);
        }
        else {
          resolve(this.lastID); // eslint-disable-line no-invalid-this
        }
      });
    });
  }

  run(sql, ...params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, err => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }
}

export let connection = new Connection();
