
buf = Buffer.from([10, 10, 10, 10, 10, 10, 10, 10])
console.log(buf.readBigInt64BE())
let check = (BigInt(buf.readUint32BE()) << 32n) + BigInt(buf.readUint32BE(4))
console.log(check)
