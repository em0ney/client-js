const Keyword = require('./keyword');

test('term generates a 64-bit BE unsigned int, field=0 (siphash)', () => {
  const kw = new Keyword(0, "foo@example.com");
  const result = kw.perform();

  expect(result).toBe(112737027418868639n);
  const buf = Buffer.alloc(8);
  buf.writeBigUint64BE(result);
  field = buf.readUint8() >> 1

  expect(field).toBe(0);
});

test('term generates a 64-bit BE unsigned int, field=7 (siphash)', () => {
  const kw = new Keyword(7, "foo@example.com");
  const result = kw.perform();

  expect(result).toBe(1121543343949859743n);
  const buf = Buffer.alloc(8);
  buf.writeBigUint64BE(result);
  field = buf.readUint8() >> 1

  expect(field).toBe(7);
});
