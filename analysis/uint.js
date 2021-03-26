
const Base = require('./base');
// TODO: Move these to methods on the base
const FIELD_SIZE = 8
const NUM_BITS = 56
const MAX_VALUE = ((1n << BigInt(NUM_BITS)) - 1n)

class UInt extends Base {
  perform(term) {
    // TODO: Force conversion to Bigint - and test that
    const term64 = BigInt(term)
    const buff = Buffer.alloc(8)

    /* Set the buffer to the big int value
     * and then set the first byte to the field.
     * This will truncate integers larger than 56 bits */
    buff.writeBigUInt64BE(term64)
    buff.writeUint8(this.field)

    return [ buff ]
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

module.exports = UInt;
