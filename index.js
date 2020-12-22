
var host = '192.168.19.110:50051';

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
const stub = new stash.Secrets(host, grpc.credentials.createInsecure());

var handle = Buffer.alloc(10);
var collectionId = Buffer.from([45, 251, 162, 85, 251, 10, 65, 42, 161, 19, 191, 136, 128, 3, 198, 103]);

var oreL = Buffer.from("ca99e1bd17ffcf66d586032ca219f0a569000000000000009281b14a1625b65c4f89baa880b663481a00000000000000d1e90cd641262d53bb2af98b32a7f3f832000000000000000fcfe8c0045a58fdf3ffd1b84d4bdce5c100000000000000cb1da7f792d289a7ccef6fc437cf6ee0c900000000000000c9d29f26de253863447a7666355a14e65200000000000000d8d2991a349a0a0f57794a1f074389f9e000000000000000a3ec0b33c67823b74d4410213ef9b15e6c00000000000000", "hex");

var oreR = Buffer.from("df4a881c807705b2889b86ce8c92514b8711346dfc350b28c0aa645efc9b63ade93bdf0a49a9dfcf1f8dd53d81b6b0ac5d01869ffcf2264eeceae7d1c29d1bb46b2db84fbaf5137ec7f30b07f1ea4de52c0d7632096d39068e7718230d2efb0ade498e193a32bc27061ecc20f8c0004e49a95000b20b7cfe150df44a8018ebc025f53b1527a21ad237cbbd2802a5b974fbc913bc12ea4cc34d564c15587959823a75140acda1c24ca993668c5738f1080e6bddb730928480f78c11646cf0fe9c57c520ff933031cc8556af168b462db41a0a970a41f23018cb10f7d1fd63b42a6f8652dec6b8e5a40affb4fb0ae7e75794a858aacbfe87f20c703e12623cbd6423e3d8d669db856cb595dc83bb6c6856", "hex");

var term = Buffer.concat([oreL, oreR]);

// TODO: Encrypt and Decrypt the body
const secret = {
  handle: handle,
  collectionId: collectionId,
  value: Buffer.from("this is a sample"),
  postingHandle: Buffer.from([54, 100, 64, 220, 156, 13]),
  term: [term]
}

//stub.Put(secret, (err, res) => {
//  console.log("ERR", err);
//  console.log("RES", res);
//});

stub.Get({collectionId: collectionId, handle: handle}, (err, res) => {
  console.log("ERR", err);
  console.log("RES", res);
  console.log(res.value.toString());
});

