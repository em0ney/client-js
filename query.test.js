
const Query = require('./query')

describe('Query builder', () => {
  test('no constraints', () => {
    const q = new Query(null)
    expect(q.constraints).toEqual([])
  })

  test('single object constraint via constructor', () => {
    const q = new Query(null, {name: "Dan"})
    expect(q.constraints).toEqual([["name", ["==", "Dan"]]])
  })

  test('multiple object constraint via constructor', () => {
    const q = new Query(null, {name: "Dan", email: "dan@coderdan.co"})
    expect(q.constraints).toEqual([["name", ["==", "Dan"]], ["email", ["==", "dan@coderdan.co"]]])
  })

  test('function constraint via constructor', () => {
    const q = new Query(null, (q) => {
      return { age: q.gte(10) }
    })
    expect(q.constraints).toEqual([["age", [">=", 10]]])
  })

  test('single object constraint via where', () => {
    const q = new Query(null).where({name: "Dan"})
    expect(q.constraints).toEqual([["name", ["==", "Dan"]]])
  })

  test('multiple object constraint via single where', () => {
    const q = new Query(null).where({name: "Dan", email: "dan@coderdan.co"})
    expect(q.constraints).toEqual([["name", ["==", "Dan"]], ["email", ["==", "dan@coderdan.co"]]])
  })

  test('multiple object constraint via chained where', () => {
    const q = new Query(null).where({name: "Dan"}).where({email: "dan@coderdan.co"})
    expect(q.constraints).toEqual([["name", ["==", "Dan"]], ["email", ["==", "dan@coderdan.co"]]])
  })

  test('object and functional constraint via chained where', () => {
    const q = new Query(null).where({name: "Dan"}).where((q) => {
      return { age: q.gte(10) }
    })

    expect(q.constraints).toEqual([["name", ["==", "Dan"]], ["age", [">=", 10]]])
  })
})

describe('Query helpers', () => {
  test('EQ', () => {
    const q = new Query(null, (q) => {
      return { age: q.eq(10) }
    })
    expect(q.constraints).toEqual([["age", ["==", 10]]])
  })

  test('GTE', () => {
    const q = new Query(null, (q) => {
      return { age: q.gte(10) }
    })
    expect(q.constraints).toEqual([["age", [">=", 10]]])
  })

  test('GT', () => {
    const q = new Query(null, (q) => {
      return { age: q.gt(20) }
    })
    expect(q.constraints).toEqual([["age", [">", 20]]])
  })

  test('LTE', () => {
    const q = new Query(null, (q) => {
      return { age: q.lte(100) }
    })
    expect(q.constraints).toEqual([["age", ["<=", 100]]])
  })

  test('LT', () => {
    const q = new Query(null, (q) => {
      return { age: q.lt(500) }
    })
    expect(q.constraints).toEqual([["age", ["<", 500]]])
  })

  test('Between', () => {
    const q = new Query(null, (q) => {
      return { age: q.between(10, 20) }
    })
    expect(q.constraints).toEqual([["age", ["><", [10, 20]]]])
  })

  test('MATCH', () => {
    const q = new Query(null, (q) => {
      return { email: q.match("dan@co") }
    })
    expect(q.constraints).toEqual([["email", ["MATCH", "dan@co"]]])
  })
})
