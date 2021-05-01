const Bool = require('./bool');

describe('perform', () => {
  test('that a literal true is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform(true)

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the string "true" is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform("true")

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the string "t" is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform("t")

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the string "1" is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform("1")

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the string "on" is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform("on")

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the literal 1 is analysed as truthy', () => {
    const bool = new Bool()
    const [result] = bool.perform(1)

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that the string "false" is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform("false")

    expect(result.readBigUInt64BE()).toEqual(0n)
  })

  test('that the string "f" is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform("f")

    expect(result.readBigUInt64BE()).toEqual(0n)
  })

  test('that the literal false is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform(false)

    expect(result.readBigUInt64BE()).toEqual(0n)
  })

  test('that the string "off" is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform("off")

    expect(result.readBigUInt64BE()).toEqual(0n)
  })

  test('that the string "0" is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform("0")

    expect(result.readBigUInt64BE()).toEqual(0n)
  })

  test('that a random string is analysed as falsy', () => {
    const bool = new Bool()
    const [result] = bool.perform("apple")

    expect(result.readBigUInt64BE()).toEqual(0n)
  })
})

describe('performForQuery', () => {
  test('that perform is used for equality', () => {
    const bool = new Bool()
    const [result] = bool.performForQuery('==', true)

    expect(result.readBigUInt64BE()).toEqual(1n)
  })

  test('that non-equality predicates throw an error', () => {
    const bool = new Bool()
    expect(() => {
      bool.performForQuery('>=', true)
    }).toThrow()
  })
})
