
const Connection = require('./connection');
const Collection = require('./collection');

class Client {
  constructor(host) {
    this.connection = new Connection(host);
  }

  collection(uuid, options = {}) {
    return new Collection(this.connection, uuid, options);
  }
}

module.exports = Client;
