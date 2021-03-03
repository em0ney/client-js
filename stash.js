
const Query = require('./query')
const path = require('path')
const GRPC = require('./grpc').V1

class Stash {
  /*
   * @param {string} host - dataService host to connect to
   * @param {AuthToken} auth - instance of an AuthToken
   * @param {string} version - for forward compatibility (only v1 is valid right now)
   */
  static async connect(host, auth, version = "v1") {
    const stash = new Stash(host, auth, version)

    /* Get a token at startup so that any federated identities
     * (required for encryption) are ready */
    await auth.getToken(host)

    return stash
  }

  /*
   * @param {string} host - the data service we are connecting to
   * @param {AuthToken} auth
   * @param {string} version - for forward compatibility (only v1 is valid right now)
   */
  constructor(host, auth, version) {
    this.stub = GRPC.API(host)
    this.host = host
    this.auth = auth
  }

  close() {
    this.stub.close()
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
  async all(collection, queryable) {
    const query = Query.from(queryable)
    const request = await collection.buildQueryRequest(query)

    return this.callGRPC('query', request).then(({result}) => {
      return collection.handleResponse(result)
    })
  }

  async get(collection, id) {
    const request = collection.buildGetRequest(id)
    return this.callGRPC('get', request).then(({value}) => {
      return collection.handleResponse(value)
    })
  }

  async put(collection, doc) {
    const request = await collection.buildPutRequest(doc)
    return this.callGRPC('put', request).then((_ret) => {
      return request.id
    })
  }

  callGRPC(fun, requestBody) {
    return new Promise((resolve, reject) => {
      /* Start by making sure we have a token */
      this.auth.getToken(this.host).then((authToken) => {
        const request = {
          context: { authToken },
          ...requestBody
        }

        this.stub[fun](request, (err, res) => {
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

module.exports = Stash
