
const AWS = require("aws-sdk")
const Client = require('../client');
const Analysis = require('../analysis');

// Not needed when running in lambda
var credentials = new AWS.SharedIniFileCredentials({profile: 'dev'});
AWS.config.credentials = credentials;

const KEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');
const generatorKeyId = 'arn:aws:kms:ap-southeast-2:377140853070:key/80c0f67d-e02a-4b59-a314-80a07ef0d4a2'

// TODO: Don't pass the generatorKeyId, set a Cipher in a collection spec
const collectionId = "de8c0950-3274-4cb8-8298-af1d5989fdfe";
const client = new Client('localhost:50051', { generatorKeyId });
const Users = client.collection(collectionId, KEY);
Users.mapping.setField('email', new Analysis.Keyword(0));
Users.mapping.setField('count', new Analysis.UInt(1));
Users.mapping.setField('name', new Analysis.TypeAhead(2));

const Collections = {}
Collections.Users = Users

// TODO: We could make this a Jest test against a real CS instance (E2E test)

function gte(val) {
  let target = BigInt(val);
  return [">=", target];
}

Users.query({count: gte(0)}).all(20)
.then((res) => console.log("MANY", res))

Users.query({count: gte(0)}).one()
  .then((res) => console.log("ONE", res))

  /*[
  {count: [">=", 0n]},
  {name: ["MATCH", "Dan"]}
].forEach((query, index) => {
  console.log("Running [", index, "]: ", query);

  col.query(query, (err, res) => {
    if (err) {
      console.log("ERR [", index, "]", err);
    } else {
      console.log("RESPONSE [", index, "]: ", res.result.toString());
    }
  });
  });*/
