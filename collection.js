
const { v4: uuidv4, stringify: uuidStringify, parse: parseUUID } = require('uuid')
const Indexer = require('./indexer')
const { SourceEncryptor, SourceDecryptor } = require('./source_encryptor')
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

  static async create(name, indexSettings, grpcStub, auth, cipherSuite) {
    // FIXME: Don't hard-code the secret ID!
    const clusterKey = await Secrets.getSecret("cs-cluster-secret-0000")
    const clusterKeyBin = Buffer.from(clusterKey, "base64")

    const hmac = crypto.createHmac('sha256', clusterKeyBin)
    hmac.update(name)
    const ref = hmac.digest()

    const indexes = {}
    indexSettings.forEach((settings, num) => {
      // When we bundle for the browser we will need to use the web crypto API
      const fieldKey = crypto.randomBytes(32)
      indexes[num] = {...settings, key: fieldKey}
    })

    const encryptedIndexes = await Promise.all(Object.entries(indexes).map(async ([fieldId, indexSettings]) => {
      const { result } = await cipherSuite.encrypt(JSON.stringify(indexSettings))
      return { field_id: parseInt(fieldId), settings: result }
    }))

    const request = {
      ref,
      indexes: encryptedIndexes
    }

    const response = await Collection.callGRPC('createCollection', grpcStub, auth, request)
    return response
  }

  static async load(name, grpcStub, auth, cipherSuite) {
    this.grpcStub = grpcStub
    this.cipherSuite = cipherSuite

    // FIXME: Don't hard-code the secret ID!
    const clusterKey = await Secrets.getSecret("cs-cluster-secret-0000")
    const clusterKeyBin = Buffer.from(clusterKey, "base64")

    const hmac = crypto.createHmac('sha256', clusterKeyBin)
    hmac.update(name)
    const ref = hmac.digest()
    const request = { ref: ref }
    // TODO: Consolidate grpcStub, auth and hostname into one class
    const {id, indexes} = await Collection.callGRPC('collectionInfo', grpcStub, auth, request)


    const decryptedIndexes  = await indexes.reduce(async (acc, index) => {
      const {settings, id} = index
      const plaintextSettings = await cipherSuite.decrypt(settings)

      return Object.assign(await acc, { [id.toString('hex')]: plaintextSettings })
    }, Promise.resolve({}))

    return new Collection(id, decryptedIndexes, grpcStub, auth, cipherSuite)
  }

  static async delete(id, grpcStub, auth) {
    const request = await Collection.buildDeleteCollectionRequest(id)
    const _response = await Collection.callGRPC('deleteCollection', grpcStub, auth, request)
    return request.id
  }

  constructor(id, indexes, grpcStub, auth, cipherSuite) {
    this.id = id
    this.grpcStub = grpcStub
    this.auth = auth
    this.mapping = new Mapping(indexes)
    this.cipherSuite = cipherSuite
  }

  async get(id) {
    const request = this.buildGetRequest(id)
    const response = await Collection.callGRPC('get', this.grpcStub, this.auth, request)
    const { source } = response
    return this.handleResponse(source)
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
    return SourceDecryptor(result, this.cipherSuite)
  }

  buildGetRequest(id) {
    return {
      collectionId: this.id,
      id: asBuffer(id)
    }
  }

  static buildDeleteCollectionRequest(id) {
    return {
      collectionId: id,
      id: asBuffer(id)
    }
  }

  async buildPutRequest(doc) {
    let docId = doc.id ? asBuffer(doc.id) : uuidv4({}, Buffer.alloc(16))

    const data = await Promise.all([
      Indexer(doc, this.mapping),
      SourceEncryptor(doc, this.cipherSuite)
    ])

    const [vectors, source] = data

    const putRequest = {
      collectionId: this.id,
      source: {
        id: docId,
        source
      },
      vectors: vectors.map(({indexId, ore}) => {
        return {
          indexId: indexId,
          terms: [{
            term: ore,
            link: docId
          }]
        }
      })
    }

    return putRequest
  }

  async buildQueryRequest({constraints, recordLimit}) {
    const queryRequest = {
      collectionId: this.id,
      query: {
        limit: recordLimit,
        constraints: constraints.flatMap(([field, condition]) =>
          this.mapping.query(field, condition)
        )
      }
    }

    return queryRequest
  }

  async handleResponse(response) {
    return SourceDecryptor(response.source, this.cipherSuite)
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
