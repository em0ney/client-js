
const Base = require('./base');
// TODO: Move these to methods on the base
const NUM_BITS = 56
const MAX_VALUE = ((1n << BigInt(NUM_BITS)) - 1n)

class UInt extends Base {
  perform(term) {
    return [ this._perform(term) ]
  }

  _perform(term) {
    // TODO: Force conversion to Bigint - and test that
    const term64 = BigInt(term)
    const buff = Buffer.alloc(8)

    buff.writeBigUInt64BE(term64)

    return buff
  }

  performForQuery(predicate, value) {
    switch (predicate) {
      case "==":
        return [this._perform(value)];

      case ">=":
        return [[this._perform(value), this._perform(MAX_VALUE)]];

      case "<=":
        return [[this._perform(0n), this._perform(value)]];

      case ">":
        return [[this._perform(BigInt(value) + 1n), this._perform(MAX_VALUE)]];

      case "<":
        return [[this._perform(0n), this._perform(BigInt(value) - 1n)]];

      case "><":
        const [min, max] = value;
        return [[this._perform(min), this._perform(max)]];

      default:
        this.throwUnknownPredicate(predicate);
    }
  }
}

module.exports = UInt;
