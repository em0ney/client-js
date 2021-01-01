
const Client = require('../client');
const Analysis = require('../analysis');
const KEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');

const collectionId = "de8c0950-3274-4cb8-8298-af1d5989fdfe";
const client = new Client('localhost:50051');
const col = client.collection(collectionId, KEY);
col.analyze('email', new Analysis.Keyword(0));
col.analyze('count', new Analysis.UInt(1));
col.analyze('name', new Analysis.TypeAhead(2));

//const id = Buffer.from('aabbc074984a4fd7b9059d9092f98bf8', 'hex');

[
  {count: 80n, email: 'foo@example.com', name: "Fred Daniels"},
  {count: 17n, email: 'dan@coderdan.co', name: "Dan Draper"},
  {count: 39n, email: 'kate@smith.com', name: "Kate Smith"}
].forEach((record) => {
  col.put(record, (err, res) => {
    if (err) {
      console.log("ERR", err);
    } else {
      console.log("RES", res);
    }
  });
});


