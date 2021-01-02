const ORE = require('@cipherstash/ore')
const Query = require('./query')
const Mapping = require('./mapping')
const { v4: uuidv4, parse: parseUUID } = require('uuid')

class Collection {
  #ore = null

  /* key is a 32 byte Buffer containing both the prf and prp keys */
  constructor(connection, uuidStr, key, options = {}) {
    this.connection = connection
    this.uuid = parseUUID(uuidStr)
    this.#ore = new ORE(key.slice(0, 16), key.slice(16, 32))
    this.autoGeneratePKey = options.autoGeneratePKey
    this.pKey = 'id'
    this.mapping = new Mapping()
  }

  setField(field, analyzer) {
    this.mapping.setField(field, analyzer)
    return this
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
    return new Query(this.connection, this.uuid, this.#ore, constraints, this.mapping);
    //const queryTerms = this.encryptTermsForQuery(query.constraints);

    //return this.connection.query(this.uuid, queryTerms, options);
  }

  // TODO: Private
  // TODO: Do the mapping in the actual mapping class!
  // Maybe this could use an Insertion class and follow the same pattern as for Query above?
  encryptTermsForInsertion(record) {
    const out = []

    for (const field in record) {
      if (field != "id") { // TODO: this is a bit clunky!
        const value = record[field];
        const plainTexts = this.mapping.map(field, value);

        /* Handle analyzers that return a single term and those
         * that return an array */
        [].concat(plainTexts).forEach((plainText) => {
          let bigUInt64 = plainText.readBigUInt64BE()
          const {left: left, right: right} = this.#ore.encrypt(bigUInt64)
          out.push(Buffer.concat([left, right]))
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
