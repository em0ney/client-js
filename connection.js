
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

  //put(collectionId, handle)

  // TODO: Use typescript and be strict about the callback type
  get(collectionId, handle, callback) {
    const request = {
      collectionId: collectionId,
      handle: handle
    };

    this.stub.Get(request, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(false, res.value);
      }
    });
  }

  // TODO: It may be easier to rename terms to postings and postingHandle to docId
  // or even pseudoDocID
  put(collectionId, handle, postingHandle, postings, callback) {
    const request = {
      handle: handle,
      collectionId: collectionId,
      value: Buffer.from("this is a sample"), // TODO: Serialize and encrypt the body
      postingHandle: postingHandle,
      term: postings
    }

    console.log("REQUEST", request);

    this.stub.Put(request, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(false, res.value);
      }
    });
  }
}

module.exports = Connection;
