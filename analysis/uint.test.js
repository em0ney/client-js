const Uint = require('./uint');

test('field is written into header byte and number term in remaining bytes', () => {
  const uint = new Uint(1)
  const result = uint.perform(100)

  expect(result.readUInt8()).toEqual(1)
  expect(result.readUInt8(7)).toEqual(100)
});

test('BigInt type writes term into bottom 7 bytes', () => {
  const uint = new Uint(27)
  const result = uint.perform(2825788001487370n)

  const check = Buffer.from([0,0,0,0,0,0,0,0])
  result.copy(check, 1, 1, 8)

  expect(result.readUInt8()).toEqual(27)
  expect(check.readBigUint64BE()).toEqual(2825788001487370n)
});

test('BigInt values larger than 7 bytes are truncated', () => {
  const uint = new Uint(91)
  const result = uint.perform(Buffer.from([10, 10, 10, 10, 10, 10, 10, 10]).readBigUint64BE())

  const check = Buffer.from([0,0,0,0,0,0,0,0])

  expect(result.readUInt8()).toEqual(91)
  expect(result).toEqual(Buffer.from([91, 10, 10, 10, 10, 10, 10, 10]))
});


// TODO: Test negative numbers
