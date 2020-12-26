
const Collection = require('./collection');
const KEY = Buffer.from('2e877eebe7f0b8ef1492f314d66c4dcce6c53234aa05cfe2dd54df83d18d09be', 'hex');

test('default pkey is "id"', () => {
  const collection = new Collection(null, "abcd", KEY);
  expect(collection.pKey).toBe('id');
});

test('setting the pkey"', () => {
  const collection = new Collection(null, "abcd", KEY);
  collection.pKey = 'another';
  expect(collection.pKey).toBe('another');
});
