
const { v4: uuidv4, parse: parseUUID } = require('uuid')
const Indexer = require('./indexer')
const { DocumentEncryptor, DocumentDecryptor } = require('./document_encryptor')
const QueryBuilder = require('./query_builder')
const Mapping = require('./mapping')
const Secrets = require('./secrets')
const crypto = require('crypto')
const Query = require('./query')

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
  static from(spec) {
    const {id, fields, cipherSuite} = spec
    const mapping = Mapping.from(fields)

    return new Collection(id, mapping, cipherSuite)
  }

  static async load(name, grpcStub, auth, cipherSuite) {
    this.grpcStub = grpcStub
    this.cipherSuite = cipherSuite

    // FIXME: Don't hard-code the secret ID!
    const clusterKey = await Secrets.getSecret("cs-cluster-secret-0000")
    const clusterKeyBin = Buffer.from(clusterKey, "base64")

    // TODO: We should B64 decode the cluster key (or later only deal with binary)

    const hmac = crypto.createHmac('sha256', clusterKeyBin)
    hmac.update("users")
    const ref = hmac.digest()
    const request = { ref: ref }
    // TODO: Consolidate grpcStub, auth and hostname into one class
    const {id, indexes} = await Collection.callGRPC('collectionInfo', grpcStub, auth, request)
    console.log("INDEXES 1", indexes)

    const decryptedIndexes = await Promise.all(new Array(indexes).reduce(async (acc, index) => {
      const {settings, field_id: fieldId} = index
      const plaintextSettings = await cipherSuite.decrypt(settings)

      return Object.assign(acc, { [fieldId]: plaintextSettings })
    }, {}))

    console.log("NEW INDEXES", decryptedIndexes)

    /*const decryptedIndexes = await Promise.all(indexes.map(async index => {
      const {settings, field_id: fieldId} = index

      return {

      return Object.assign(index, {
        settings: await cipherSuite.decrypt(settings)
        })
    }*/

    return new Collection(id, decryptedIndexes, grpcStub, auth, cipherSuite)
  }

  constructor(id, indexes, grpcStub, auth, cipherSuite) {
    console.log(indexes)
    this.id = id
    this.grpcStub = grpcStub
    this.auth = auth
    this.mapping = new Mapping(indexes)
    this.cipherSuite = cipherSuite
  }

  async get(id) {
    const request = this.buildGetRequest(id)
    const { value } = await Collection.callGRPC('get', this.grpcStub, this.auth, request)
    return this.handleResponse(value)
  }

  async put(doc) {
    const request = await this.buildPutRequest(doc)
    // TODO: Read the ID from the response
    const _response = await Collection.callGRPC('put', this.grpcStub, this.auth, request)
    return request.id
  }

  /* Can be used in several ways:
   *
   * @example With a simple object constraint:
   *
   *     stash.all(User, {email: "name@example.com"})
   *
   * @example With a `Query` object:
   *
   *     const query = new Query({name: "Foo Bar"})
   *     stash.all(User, query)
   *
   * @example With a function:
   *
   *     stash.all(User, (q) => {
   *       return { age: q.gte(20) }
   *     })
   *
   * Note that the default limit for the all function is 20.
   * Use a `Query` to change the limit.
   *
   */
  async all(queryable) {
    const query = Query.from(queryable)
    const request = await this.buildQueryRequest(query)

    const { result } = await Collection.callGRPC('query', this.grpcStub, this.auth, request)
    return this.handleResponse(result)
  }

  buildGetRequest(id) {
    return {
      collectionId: this.id,
      id: asBuffer(id)
    }
  }

  async buildPutRequest(doc) {
    // TODO Put into a utility function
    let docId = uuidv4({}, Buffer.alloc(16));

    if (doc.id) {
      docId = asBuffer(doc.id);
    }

    const data = await Promise.all([
      Indexer(doc, this.mapping),
      DocumentEncryptor(doc, this.cipherSuite)
    ])
    const [postings, source] = data

    return {
      collectionId: this.id,
      value: source,
      id: docId,
      posting: docId,
      terms: postings
    }
  }

  async buildQueryRequest({constraints, recordLimit}) {
    // TODO: This should return an object containing limit, after and terms
    const terms = constraints.flatMap(([field, condition]) => {
      return this.mapping.query(field, condition)
    })
    return {
      collectionId: this.id,
      terms: terms,
      limit: recordLimit
    }
  }

  async handleResponse(response) {
    return DocumentDecryptor(response, this.cipherSuite)
  }

  static callGRPC(fun, stub, auth, requestBody) {
    return new Promise((resolve, reject) => {
      /* Start by making sure we have a token */
      // FIXME: Don't pass the host to getToken
      auth.getToken('localhost:50001').then((authToken) => {
        const request = {
          context: { authToken },
          ...requestBody
        }

        stub[fun](request, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

module.exports = Collection
