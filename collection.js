const ORE = require('@cipherstash/ore');
const Query = require('./query');
const { v4: uuidv4, parse: parseUUID } = require('uuid');

class Collection {
  #ore = null;

  /* key is a 32 byte Buffer containing both the prf and prp keys */
  constructor(connection, uuidStr, key, options = {}) {
    this.connection = connection;
    this.uuid = parseUUID(uuidStr);
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
    const docId = this.#asBuffer(id);
    this.connection.get(this.uuid, docId, callback);
  }

  put(attrs, callback) {
    const postings = this.encryptTermsForInsertion(attrs);
    let docId = null;

    if (attrs.id) {
      docId = this.#asBuffer(attrs.id);
    } else {
      docId = uuidv4({}, Buffer.alloc(16));
    }

    // TODO: Value
    this.connection.put(
      this.uuid,
      docId,
      docId, // Posting target and docID are the same right now (later there might be a PRF or PRP)
      postings,
      callback
    );
  }

  query(constraints) {
    return new Query(this.connection, this.uuid, this.#ore, constraints, this.analyzers);
    //const queryTerms = this.encryptTermsForQuery(query.constraints);

    //return this.connection.query(this.uuid, queryTerms, options);
  }

  // TODO: Private
  // Maybe this could use an Insertion class and follow the same pattern as for Query above?
  encryptTermsForInsertion(attrs) {
    const out = []

    for (const attr in attrs) {
      if (attr != "id") { // TODO: this is a bit clunky!
        // TODO: Handle null analyzer
        const analyzer = this.analyzers[attr];
        const value = attrs[attr];
        const plainTexts = analyzer.perform(value);

        /* Handle analyzers that return a single term and those
         * that return an array */
        [].concat(plainTexts).forEach((plainText) => {
          const {left: left, right: right} = this.#ore.encrypt(plainText);
          out.push(Buffer.concat([left, right]));
        });
      }
    }
    return out;
  }

  #asBuffer(id) {
    // TODO: Check that id is a num, bigint smaller than 64bits or a Buffer
    if (id instanceof Buffer) {
      return id;
    } else {
      const buf = Buffer.alloc(8);
      buf.writeBigUInt64BE(id);
      return buf;
    }
  }
}

module.exports = Collection;
