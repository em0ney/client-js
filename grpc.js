
const gRPC = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')

const PROTO_BASE_PATH = path.join(module.path, 'dist', 'grpc')
const PROTO_FILE = path.join(PROTO_BASE_PATH, 'v1', 'documents', 'api.proto')

const packageDefinition = protoLoader.loadSync(
  PROTO_FILE, {
    includeDirs: [path.join(PROTO_BASE_PATH, 'v1')],
    keepCase: true,
    longs: Number,
    enums: String,
    defaults: true,
    oneofs: true
  }
)

const StashProto = gRPC.loadPackageDefinition(packageDefinition).stash

// TODO: Don't use insecure creds (i.e. use SSL)
const gRPCCreds = gRPC.credentials.createInsecure()

const V1 = {
  Documents: function(host) {
    return new StashProto.GRPC.V1.Documents.API(host, gRPCCreds)
  }
}

module.exports = { V1: V1 }
