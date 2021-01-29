const Indexer = require('./indexer')
const Mapping = require('./mapping')

test('nothing is indexed by an empty mapping', async () => {
  const mapping = new Mapping()
  const terms = await Indexer({name: "Dan"}, mapping, null)
  expect(terms).toEqual([])
})

test('nothing is indexed when no matching fields are mapped', async () => {
  const mapping = Mapping.from({email: {number: 0, analyzer: "typeahead"}})
  const terms = await Indexer({name: "Dan"}, mapping, null)
  expect(terms).toEqual([])
})

test('mapped fields are analyzed', async () => {
  // Use keyword for all mappings as it will always give exactly one term per field
  const mapping = Mapping.from({
    email: {number: 0, analyzer: "keyword"},
    age:   {number: 1, analyzer: "keyword"},
  })

  let i = 1
  const cs = {
    encryptTerm: jest.fn(term => {
      return {left: Buffer.from([i++]), right: Buffer.from([i++])}
    })
  }

  const terms = await Indexer({email: "Dan", age: 20}, mapping, cs)
  expect(terms).toHaveLength(2)
  expect(terms).toContainEqual(Buffer.from([1, 2]))
  expect(terms).toContainEqual(Buffer.from([3, 4]))
})
