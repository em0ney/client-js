const Mapping = require('./mapping')
const {Keyword, TypeAhead, UInt} = require('./analysis')

test('get field with no analyzer set', () => {
  const mapping = new Mapping()
  expect(() => mapping.getField('city')).toThrow(/Field 'city' not defined/)
})

test('set and get field and analyzer', () => {
  const mapping = new Mapping()
  mapping.setField('city', Keyword)
  expect(mapping.getField('city')).toEqual(Keyword)
})

test('mapping a field analyzes it using the assigned analyzer', () => {
  const mapping = new Mapping()
  const analyzer = new Keyword(1)
  mapping.setField('city', new Keyword(1))
  expect(mapping.map('city', 'Sydney')).toEqual(analyzer.perform('Sydney'))
})

describe('Analyzer shortcuts', () => {
  test('keyword analyzer correctly instantiates', () => {
    const analyzer = Mapping.analyzer(1, 'keyword')
    expect(analyzer).toBeInstanceOf(Keyword)
    expect(analyzer.field).toEqual(1)
  })

  test('typeahead analyzer correctly instantiates', () => {
    const analyzer = Mapping.analyzer(3, 'typeahead')
    expect(analyzer).toBeInstanceOf(TypeAhead)
    expect(analyzer.field).toEqual(3)
  })

  test('uint analyzer correctly instantiates', () => {
    const analyzer = Mapping.analyzer(2, 'uint')
    expect(analyzer).toBeInstanceOf(UInt)
    expect(analyzer.field).toEqual(2)
  })
})

describe('Mapping.from', () => {
  test('that the mapping is constructed correctly from a given definition', () => {
    const definition = {
      name: {number: 0, analyzer: "typeahead"},
      age: {number: 1, analyzer: "uint"}
    }

    const mapping = Mapping.from(definition)
    expect(mapping.analyzers['name']).toBeInstanceOf(TypeAhead)
    expect(mapping.analyzers['name'].field).toEqual(0)
    expect(mapping.analyzers['age']).toBeInstanceOf(UInt)
    expect(mapping.analyzers['age'].field).toEqual(1)
  })
})
