
const { v4: uuidv4, parse: parseUUID } = require('uuid')
const Indexer = require('./indexer')
const { DocumentEncryptor, DocumentDecryptor } = require('./document_encryptor')

// Put this in a Util module
function asBuffer(id) {
  // TODO: Check that id is a num, bigint smaller than 64bits or a Buffer
  if (id instanceof Buffer) {
    return id;
  } else {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(id));
    return buf;
  }
}


class Collection {
  constructor(uuidStr, mapping, cipherSuite) {
    this.id = parseUUID(uuidStr)
    this.mapping = mapping
    this.cipherSuite = cipherSuite
  }

  buildGetRequest(id) {
    return {
      collectionId: this.id,
      handle: asBuffer(id)
    };
  }

  async buildPutRequest(doc) {
    // TODO Put into a utility function
    let docId = uuidv4({}, Buffer.alloc(16));

    if (doc.id) {
      docId = asBuffer(doc.id);
    }

    return Promise.all([
      Indexer(doc, this.mapping, this.cipherSuite),
      DocumentEncryptor(doc, this.cipherSuite)
    ]).then((data) => {
      const [postings, source] = data
      return {
        collectionId: this.id,
        value: source,
        handle: docId,
        postingHandle: docId,
        term: postings
      }
    })
  }

  async buildQueryRequest(query) {
    return QueryBuilder(query, this.mapping, this.cipherSuite)
  }

  // TODO: Sometimes the response has a key of value, and sometimes result - make it consistent
  async handleResponse(response) {
    return DocumentDecryptor(response, this.cipherSuite)
  }
}

module.exports = Collection
