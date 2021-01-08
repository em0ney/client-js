
const gRPC = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Query = require('./query')

const packageDefinition = protoLoader.loadSync(
  "stash.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const StashService = gRPC.loadPackageDefinition(packageDefinition).stash;

class Stash {
  static connect(host) {
    const stash = new Stash(host)

    return new Promise((resolve, reject) => {
      resolve(stash)
    }) //TODO: How to close?.finally(() => stash.close())
  }

  // TODO: Don't use insecure creds
  constructor(host) {
    const creds = gRPC.credentials.createInsecure();
    this.stub = new StashService.Secrets(host, creds);
  }

  close() {
    this.stub.close()
  }

  /* Can be used in several ways:
   *
   * With a simple object constraint:
   *
   *     stash.all(User, {email: "name@example.com"})
   *
   * With a `Query` object:
   *
   *     const query = new Query({name: "Foo Bar"})
   *     stash.all(User, query)
   *
   * With a function:
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
    const query = (queryable instanceof Query) ? queryable : new Query(queryable)
    const request = await collection.buildQueryRequest(query)

    return new Promise((resolve, reject) => {
      this.stub.Query(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    }).then(({result}) => {
      return collection.handleResponse(result)
    })
  }

  async get(collection, id) {
    const request = collection.buildGetRequest(id)
    // TODO: Try splitting this out (no need to use call or apply, just do foo())
    return new Promise((resolve, reject) => {
      this.stub.Get(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    }).then(({value}) => {
      return collection.handleResponse(value)
    })
  }

  async put(collection, doc) {
    const request = await collection.buildPutRequest(doc)
    return new Promise((resolve, reject) => {
      this.stub.Put(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    }).then((_ret) => {
      return request.handle
    })
  }
}

module.exports = Stash
