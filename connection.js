
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

  // TODO: Use typescript and be strict about the callback type
  get(collectionId, handle, callback) {
    const request = {
      collectionId: collectionId,
      handle: handle
    };

    this.stub.Get(request, callback);
  }

  // TODO: It may be easier to rename terms to postings and postingHandle to docId
  // or even pseudoDocID
  put(collectionId, handle, postingHandle, postings, callback) {
    // TODO: Validate args (e.g. handle must not be null and must be a Buffer) - TypeScript?
    const request = {
      handle: handle,
      collectionId: collectionId,
      value: Buffer.from("this is a sample"), // TODO: Serialize and encrypt the body
      postingHandle: postingHandle,
      term: postings
    }

    this.stub.Put(request, callback);
  }

  query(collectionId, terms, options, callback) {
    const limit = options.limit || 20;
    const request = {
      collectionId: collectionId,
      term: terms,
      limit: limit
    };

    this.stub.Query(request, callback);
  }
}

module.exports = Connection;
