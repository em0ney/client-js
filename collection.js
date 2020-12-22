
class Collection {
  constructor(client, uuid, options = {}) {
    this.client = client;
    this.uuid = uuid;
    this.autoGeneratePKey = options.autoGeneratePKey;
    this.pKey = 'id';
    this.analyzers = {}
  }

  analyze(attr, analyzer) {
    this.analyzers[attr] = analyzer
  }
}

module.exports = Collection;
