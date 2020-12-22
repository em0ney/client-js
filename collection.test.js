
const Collection = require('./collection');

test('default pkey is "id"', () => {
  const collection = new Collection(null, "abcd");
  expect(collection.pKey).toBe('id');
});

test('setting the pkey"', () => {
  const collection = new Collection(null, "abcd");
  collection.pKey = 'another';
  expect(collection.pKey).toBe('another');
});
