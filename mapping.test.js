const Mapping = require('./mapping')
const Keyword = require('./analysis').Keyword

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
