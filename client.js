
const Connection = require('./connection');
const Collection = require('./collection');

class Client {
  constructor(host, { generatorKeyId }) {
    this.connection = new Connection(host)
    this.generatorKeyId = generatorKeyId
  }

  // TODO: Use an object for the different parameters
  // TODO: Allow the ORE key to be set on the client as a default, too
  collection(uuid, key, options = {}) {
    const gKeyId = options.generatorKeyId || this.generatorKeyId
    return new Collection(this.connection, uuid, key, gKeyId, options)
  }

  close() {
    this.connection.close()
  }
}

module.exports = Client;
