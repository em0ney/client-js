const Timestamp = require('./utc-timestamp');

test('a Date object is encoded as a 64-bit buffer', () => {
  const timestamp = new Timestamp()
  const [result] = timestamp.perform(new Date("2021-04-29T05:54:39.285Z"))

  expect(result.readBigUInt64BE()).toEqual(1619675679285n)
})

describe('Comparisons', () => {
  test('that two dates in different years compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 3, 29, 5, 54, 39, 285))
    const [b] = timestamp.perform(new Date(2020, 3, 29, 5, 54, 39, 285))

    expect(a.readBigUInt64BE()).toBeGreaterThan(b.readBigUInt64BE())
  })

  test('that two dates in different months of the same year compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 3, 29, 5, 54, 39, 285))
    const [b] = timestamp.perform(new Date(2021, 4, 29, 5, 54, 39, 285))

    expect(a.readBigUInt64BE()).toBeLessThan(b.readBigUInt64BE())
  })

  test('that two dates in different days of the same month compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 4, 25, 5, 54, 39, 285))
    const [b] = timestamp.perform(new Date(2021, 4, 29, 5, 54, 39, 285))

    expect(a.readBigUInt64BE()).toBeLessThan(b.readBigUInt64BE())
  })

  test('that two dates in different hours of the same day compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 4, 25, 8, 54, 39, 285))
    const [b] = timestamp.perform(new Date(2021, 4, 25, 6, 54, 39, 285))

    expect(a.readBigUInt64BE()).toBeGreaterThan(b.readBigUInt64BE())
  })

  test('that two dates in different minutes of the same hour compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 4, 25, 8, 17, 39, 285))
    const [b] = timestamp.perform(new Date(2021, 4, 25, 8, 54, 39, 285))

    expect(a.readBigUInt64BE()).toBeLessThan(b.readBigUInt64BE())
  })

  test('that two dates in different seconds of the same minute compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 4, 25, 8, 17, 39, 285))
    const [b] = timestamp.perform(new Date(2021, 4, 25, 8, 17, 40, 285))

    expect(a.readBigUInt64BE()).toBeLessThan(b.readBigUInt64BE())
  })

  test('that two dates in different fractions of the same second compare correctly', () => {
    const timestamp = new Timestamp()
    const [a] = timestamp.perform(new Date(2021, 4, 25, 8, 17, 40, 100))
    const [b] = timestamp.perform(new Date(2021, 4, 25, 8, 17, 40, 285))

    expect(a.readBigUInt64BE()).toBeLessThan(b.readBigUInt64BE())
  })
})

