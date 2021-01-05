
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  "stash.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const stash = grpc.loadPackageDefinition(packageDefinition).stash;

class Connection {
  // TODO: Don't use insecure creds
  constructor(host) {
    const creds = grpc.credentials.createInsecure();
    this.stub = new stash.Secrets(host, creds);
  }

  close() {
    this.stub.close()
  }

  get(request) {
     return new Promise((resolve, reject) => {
      this.stub.Get(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  // TODO: It may be easier to rename terms to postings and postingHandle to docId
  // or even pseudoDocID
  // TODO: Validate args (e.g. handle must not be null and must be a Buffer) - TypeScript?
  put(request) {
    return new Promise((resolve, reject) => {
      this.stub.Put(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  query(request) {
    return new Promise((resolve, reject) => {
      // TODO: Can this callback be extracted out?
      this.stub.Query(request, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

module.exports = Connection;
