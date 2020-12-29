const Client = require('../client');
const Analysis = require('../analysis');
const KEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');

const collectionId = "de8c0950-3274-4cb8-8298-af1d5989fdfe";
const client = new Client('localhost:50051');
const col = client.collection(collectionId, KEY);
col.analyze('email', new Analysis.Keyword(0));
col.analyze('count', new Analysis.UInt57(1));
col.analyze('name', new Analysis.TypeAhead(2));

// TODO: We could make this a Jest test against a real CS instance (E2E test)

[
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
});
