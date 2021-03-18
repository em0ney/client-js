const Mapping = require('./mapping')
const {Keyword, TypeAhead, UInt} = require('./analysis')

const fieldKeyCity = "c55f5b0221336878fe4b9a63e2fa89d73956c6492a40c53b312254f85ed4e209"
const fieldKeyAge = "ef135cf590e5bac75451d3f512d9f80eaf65a4198663c5fc57ffb264c6ed0eee"

const cityAndAgeMapper = new Mapping({
  0: { name: 'city', analyzer: 'keyword', key: fieldKeyCity },
  1: { name: 'age', analyzer: 'uint', key: fieldKeyAge },
})

test('get field with no analyzer set', () => {
  const mapping = new Mapping({})
  expect(() => mapping.getField('city')).toThrow(/Field 'city' not defined/)
})

test('set and get field settings', () => {
  expect(cityAndAgeMapper.getField('city')).toEqual({analyzer: new Keyword('0'), key: fieldKeyCity})
  expect(cityAndAgeMapper.getField('age')).toEqual({analyzer: new UInt('1'), key: fieldKeyAge})
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

describe('Map.all()', () => {
  test('that the defined fields are mapped', () => {
    const result = cityAndAgeMapper.mapAll({city: "Sydney", age: 180})

    // TODO: We really should use ORE compare to check that the terms
    // have been generated correctly (but that requires `node-ore` to have compare
    // implemented)
    expect(result).toHaveLength(2)
  })

  test('that ONLY the defined fields are mapped and other values are ignored', () => {
    const result = cityAndAgeMapper.mapAll({city: "Sydney", age: 180, foo: "Bar", x: 7})

    expect(result).toHaveLength(2)
    // TODO: ORE should be checked (see above)
  })


  // TODO: Test a field with an analyzer that generates more than 1 term (flatmap)
})

