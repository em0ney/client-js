const ORE = require('@cipherstash/ore')
const Query = require('./query')
const Mapping = require('./mapping')
const { v4: uuidv4, parse: parseUUID } = require('uuid')
const Cipher = require('./cipher')
//const { enc: Encryptor, dec: Decryptor } = require('./encdec')


// TODO: A neater pattern could be to use an Insertion object, Fetch object a bit like the Query (CQRS pattern?)
// Each is passed a connection spec (including mapping, ORE and Cipher details) and a grpc client
// The Insertion (for example) would delegate most of the work to the connection
// The connection would not actually hit the grpc connection, the Insertion would


class Collection {
  #ore = null

  /* key is a 32 byte Buffer containing both the prf and prp keys
   * generatorKeyId is the ID of the KMS key used to encdec source/body
  * */
  constructor(connection, uuidStr, key, generatorKeyId, options = {}) {
    this.connection = connection
    this.uuid = parseUUID(uuidStr)
    this.#ore = new ORE(key.slice(0, 16), key.slice(16, 32))
    this.autoGeneratePKey = options.autoGeneratePKey
    this.pKey = 'id'
    this.mapping = new Mapping()
    this.cipher = new Cipher(generatorKeyId)
  }

  setField(field, analyzer) {
    this.mapping.setField(field, analyzer)
    return this
  }

  async get(id) {
    const docId = this.#asBuffer(id);
    const request = {
      collectionId: this.uuid,
      handle: docId
    };
    return this.connection.get(request).then(({ value }) => {
      return this.cipher.decrypt(value)
    })
  }

  async put(attrs) {
    let docId = null
    let collectionId = this.uuid

    if (attrs.id) {
      docId = this.#asBuffer(attrs.id);
    } else {
      docId = uuidv4({}, Buffer.alloc(16));
    }

    return Promise.all([
      this.encryptTermsForInsertion(attrs),
      this.cipher.encrypt(attrs)
    ]).then((data) => {
      const [postings, {result }] = data

      // Posting target and docID are the same right now (later there might be a PRF or PRP)
      return this.connection.put({
        collectionId: collectionId,
        value: result,
        handle: docId,
        postingHandle: docId,
        term: postings
      })
    })
  }

  query(constraints) {
    return new Query(this.connection, this.uuid, this.#ore, constraints, this.mapping, this.cipher);
    //const queryTerms = this.encryptTermsForQuery(query.constraints);

    //return this.connection.query(this.uuid, queryTerms, options);
  }

  // TODO: Private
  // TODO: Do the mapping in the actual mapping class!
  // Maybe this could use an Insertion class and follow the same pattern as for Query above?
  async encryptTermsForInsertion(record) {
    const out = []

    for (const field in record) {
      if (field != "id") { // TODO: this is a bit clunky!
        const value = record[field];
        const plainTexts = this.mapping.map(field, value);

        /* Handle analyzers that return a single term and those
         * that return an array */
        [].concat(plainTexts).forEach((plainText) => {
          let bigUInt64 = plainText.readBigUInt64BE()
          const { left, right} = this.#ore.encrypt(bigUInt64)
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
      buf.writeBigUInt64BE(BigInt(id));
      return buf;
    }
  }
}

module.exports = Collection;
