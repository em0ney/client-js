const Indexer = require('./indexer')
const Mapping = require('./mapping')

const { Keyword, UInt } = require('./analysis')

test('nothing is indexed by an empty mapping', async () => {
  const mapping = new Mapping()
  const terms = await Indexer({name: "Dan"}, mapping, null)
  expect(terms).toEqual([])
})

test('nothing is indexed when no matching fields are mapped', async () => {
  const emailFieldKey = "b7618ba68a9513a093af67a309059c4d560dbdde9c382dc08ea6d3836defed34"
  const mapping = new Mapping()
  mapping.setField("email", new Keyword(0), emailFieldKey)
 
  const terms = await Indexer({name: "Dan"}, mapping, null)
  expect(terms).toEqual([])
})

test('mapped fields are analyzed', async () => {
  // Use keyword for all mappings as it will always give exactly one term per field
  const emailFieldKey = "b7618ba68a9513a093af67a309059c4d560dbdde9c382dc08ea6d3836defed34"
  const ageFieldKey = "28c5029dc5436d9563ea2b768a2dc03f7c0f56d7cce7dfc08af30d8e1d457a02"
  const mapping = new Mapping()
  mapping.setField("email", new Keyword(0), emailFieldKey)
  mapping.setField("age", new UInt(1), ageFieldKey)

  const terms = await Indexer({email: "Dan", age: 20}, mapping)
  expect(terms).toHaveLength(2)
})
