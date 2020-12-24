const ORE = require('@cipherstash/ore');

class Collection {
  #ore = null;

  /* key is a 32 byte Buffer containing both the prf and prp keys */
  constructor(connection, uuid, key, options = {}) {
    this.connection = connection;
    this.uuid = uuid;
    this.#ore = new ORE(key.slice(0, 16), key.slice(16, 32));
    this.autoGeneratePKey = options.autoGeneratePKey;
    this.pKey = 'id';
    this.analyzers = {}
  }

  // TODO: Private
  analyze(attr, analyzer) {
    this.analyzers[attr] = analyzer
  }

  get(id, callback) {
    const docId = Buffer.alloc(8);
    docId.writeBigUInt64BE(id);
    this.connection.get(this.uuid, docId, callback);
  }

  // TODO: Analyzers need to have the field index "baked in"
  put(attrs, callback) {
    const postings = this.encryptTermsForInsertion(attrs);
    // TODO: Autogenerate or error if no ID present
    const docId = Buffer.alloc(8);
    docId.writeBigUInt64BE(attrs.id);

    // TODO: Value
    this.connection.put(
      this.uuid,
      docId,
      docId, // Posting target and docID are the same right now (later there might be a PRF or PRP)
      postings,
      callback
    );
  }

  // TODO: Private
  encryptTermsForInsertion(attrs) {
    const out = []

    for (const attr in attrs) {
      if (attr != "id") { // TODO: this is a bit clunky!
        // TODO: Handle null analyzer
        const analyzer = this.analyzers[attr];
        const value = attrs[attr];
        const plainText = analyzer.perform(value);
        const {left: left, right: right} = this.#ore.encrypt(plainText);

        out.push(Buffer.concat([left, right]));
      }
    }
    return out;
  }
}

module.exports = Collection;
