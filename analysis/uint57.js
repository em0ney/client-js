
const Base = require('./base');
const NUM_BITS = 57
const MAX_VALUE = ((1n << BigInt(NUM_BITS)) - 1n)

class UInt57 extends Base {
  perform(term) {
    // TODO: Force conversion to Bigint - and test that
    const term64 = BigInt(term);
    const buff = Buffer.alloc(8);
    buff.writeBigUInt64BE(term64);
    buff.writeUint8((this.field << 1) + (buff.readUint8() & 1));

    // TODO: ORE Encrypt (in the caller but not here)
    return buff.readBigUint64BE();
  }

  performForQuery(predicate, value) {
    switch (predicate) {
      case "==":
        return [this.perform(value)];

      case ">=":
        return [[this.perform(value), this.perform(MAX_VALUE)]];

      case "<=":
        return [[0n, this.perform(value)]];

      case ">":
        return [[this.perform(BigInt(value) + 1n), this.perform(MAX_VALUE)]];

      case "<":
        return [[0n, this.perform(BigInt(value) - 1n)]];

      case "><":
        const [min, max] = value;
        return [[this.perform(min), this.perform(max)]];

      default:
        this.throwUnknownPredicate(predicate);
    }
  }
}
 
module.exports = UInt57;
